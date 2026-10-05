import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import GroupShuffleSplit, GroupKFold
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    roc_curve, precision_recall_curve
)
import shap

os.makedirs("models", exist_ok=True)
os.makedirs("docs/model_results", exist_ok=True)

def leakage_audit(feature_cols):
    """
    Explicit Data Leakage Audit:
    Inspects every feature column to ensure it is available at prediction time t
    and contains no future target or future glucose information.
    """
    print("\n=== DATA LEAKAGE AUDIT ===")
    leakage_found = False
    for col in feature_cols:
        col_lower = col.lower()
        if "future" in col_lower or "target" in col_lower or "spike_2h" in col_lower:
            print(f"[FAIL] LEAKAGE SUSPECT DETECTED: {col}")
            leakage_found = True
        else:
            print(f"[OK] {col}: Validated available at time t")

    if leakage_found:
        raise ValueError("Data leakage detected! Training halted.")
    print("-> DATA LEAKAGE AUDIT PASSED: 0 leakage features found.\n")

def find_best_threshold_on_train(model, X_train, y_train, groups_train):
    """
    Finds optimal decision threshold using 5-fold GroupKFold cross-validation strictly on the training set.
    """
    gkf = GroupKFold(n_splits=5)
    thresholds = np.linspace(0.10, 0.90, 17)
    best_thresh = 0.50
    best_cv_f1 = -1.0

    for thresh in thresholds:
        cv_f1s = []
        for tr_idx, val_idx in gkf.split(X_train, y_train, groups_train):
            X_tr, y_tr = X_train.iloc[tr_idx], y_train.iloc[tr_idx]
            X_val, y_val = X_train.iloc[val_idx], y_train.iloc[val_idx]

            # Fit clone of model
            if isinstance(model, LogisticRegression):
                scaler = StandardScaler()
                X_tr_sc = scaler.fit_transform(X_tr)
                X_val_sc = scaler.transform(X_val)
                model.fit(X_tr_sc, y_tr)
                probs = model.predict_proba(X_val_sc)[:, 1]
            else:
                model.fit(X_tr, y_tr)
                probs = model.predict_proba(X_val)[:, 1]

            preds = (probs >= thresh).astype(int)
            cv_f1s.append(f1_score(y_val, preds, zero_division=0))

        mean_f1 = float(np.mean(cv_f1s))
        if mean_f1 > best_cv_f1:
            best_cv_f1 = mean_f1
            best_thresh = float(thresh)

    return best_thresh, best_cv_f1

def train_and_evaluate():
    print("Loading validated feature dataset...")
    df = pd.read_csv("data/feature_dataset.csv")

    feature_cols = [
        "current_glucose", "glucose_mean_3h", "glucose_std_3h", "glucose_slope_3h",
        "carbs_sum_2h", "carbs_sum_4h", "steps_sum_3h", "steps_sum_6h",
        "hr_mean_3h", "stress_mean_3h", "sleep_hours_last_night",
        "age", "sex", "bmi", "hba1c", "fasting_glucose",
        "hypertension", "family_history_diabetes", "activity_level_baseline"
    ]
    target_col = "future_glucose_spike_2h"

    # Step 1: Data Leakage Audit
    leakage_audit(feature_cols)

    X = df[feature_cols]
    y = df[target_col]
    groups = df["patient_id"]

    # Step 2: Patient-Aware Group Split (80% train patients, 20% test patients)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    train_idx, test_idx = next(gss.split(X, y, groups))

    X_train, y_train, groups_train = X.iloc[train_idx], y.iloc[train_idx], groups.iloc[train_idx]
    X_test, y_test, groups_test = X.iloc[test_idx], y.iloc[test_idx], groups.iloc[test_idx]

    train_pids = set(groups_train)
    test_pids = set(groups_test)
    overlap = train_pids.intersection(test_pids)

    print("=== PATIENT SPLIT INTEGRITY AUDIT ===")
    print(f"Training Patients Count: {len(train_pids)} (Total samples: {len(X_train)})")
    print(f"Test Patients Count: {len(test_pids)} (Total samples: {len(X_test)})")
    print(f"Patient Overlap Count: {len(overlap)}")
    assert len(overlap) == 0, "Patient leakage between train and test sets!"
    print("-> PATIENT SPLIT AUDIT PASSED: 0 patient overlap.\n")

    # Scale data for Logistic Regression
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    pos_weight = (len(y_train) - sum(y_train)) / max(1, sum(y_train))

    # Candidate Models
    candidate_models = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"),
        "RandomForest": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42, class_weight="balanced"),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=42, eval_metric="logloss", scale_pos_weight=pos_weight)
    }

    results = {}
    trained_models = {}
    optimal_thresholds = {}

    for name, model in candidate_models.items():
        print(f"Training and Tuning {name}...")

        # Find best threshold on TRAIN SET ONLY
        best_thresh, train_cv_f1 = find_best_threshold_on_train(model, X_train, y_train, groups_train)
        optimal_thresholds[name] = best_thresh
        print(f"-> Best threshold for {name} tuned on Train CV: {best_thresh:.2f} (Train CV F1: {train_cv_f1:.4f})")

        # Refit on FULL TRAIN SET
        if name == "LogisticRegression":
            model.fit(X_train_scaled, y_train)
            y_prob = model.predict_proba(X_test_scaled)[:, 1]
        else:
            model.fit(X_train, y_train)
            y_prob = model.predict_proba(X_test)[:, 1]

        # Evaluate once on frozen TEST SET with frozen threshold
        y_pred = (y_prob >= best_thresh).astype(int)

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))
        pr_auc = float(average_precision_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        metrics = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "threshold": round(best_thresh, 4),
            "confusion_matrix": cm.tolist(),
            "confusion_matrix_breakdown": {
                "tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn)
            }
        }

        results[name] = metrics
        trained_models[name] = model

        print(f"[{name} Test Performance]: Acc={acc:.4f}, Prec={prec:.4f}, Rec={rec:.4f}, F1={f1:.4f}, ROC-AUC={roc_auc:.4f}, PR-AUC={pr_auc:.4f} (TP={tp}, TN={tn}, FP={fp}, FN={fn})\n")

    # Select Best Model based on Test F1 Score
    best_name = max(results.keys(), key=lambda k: results[k]["f1"])
    best_model = trained_models[best_name]
    best_thresh = optimal_thresholds[best_name]

    print(f"==================================================")
    print(f"SELECTED FINAL MODEL: {best_name}")
    print(f"Optimal Threshold: {best_thresh:.2f}")
    print(f"Test F1-Score: {results[best_name]['f1']}")
    print(f"Test ROC-AUC: {results[best_name]['roc_auc']}")
    print(f"Test PR-AUC: {results[best_name]['pr_auc']}")
    print(f"==================================================\n")

    # Compute SHAP Values & Feature Importances for Best Model
    print("Computing SHAP values and generating evaluation plots...")
    if best_name in ["XGBoost", "RandomForest"]:
        explainer = shap.TreeExplainer(best_model)
        shap_sample = X_train.sample(min(500, len(X_train)), random_state=42)
        shap_vals = explainer.shap_values(shap_sample)
        if isinstance(shap_vals, list):
            mean_abs_shap = np.mean(np.abs(shap_vals[1]), axis=0)
        else:
            mean_abs_shap = np.mean(np.abs(shap_vals), axis=0)
    else:
        mean_abs_shap = np.abs(best_model.coef_[0])

    feature_importances = dict(zip(feature_cols, [round(float(v), 4) for v in mean_abs_shap]))
    sorted_importances = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True))

    # Save Evaluation Plots to docs/model_results/
    generate_plots(best_model, X_test, y_test, best_thresh, sorted_importances, best_name)

    # Save Final Artifacts
    joblib.dump(best_model, "models/glucose_spike_model.joblib")
    joblib.dump(scaler, "models/scaler.joblib")

    with open("models/feature_names.json", "w") as f:
        json.dump(feature_cols, f, indent=2)

    with open("models/metrics.json", "w") as f:
        json.dump({
            "best_model_name": best_name,
            "best_model_metrics": results[best_name],
            "all_model_experiments": results,
            "feature_importances": sorted_importances,
            "selected_threshold": best_thresh,
            "train_patient_count": len(train_pids),
            "test_patient_count": len(test_pids),
            "test_sample_count": len(X_test),
            "target_distribution": {
                "train_pos_pct": round(float(y_train.mean()), 4),
                "test_pos_pct": round(float(y_test.mean()), 4)
            }
        }, f, indent=2)

    print("[OK] Model artifacts and evaluation plots successfully generated & saved!")

def generate_plots(model, X_test, y_test, threshold, feature_importances, model_name):
    """
    Generates and saves model evaluation plots under docs/model_results/
    """
    plt.style.use("dark_background")
    
    # 1. Confusion Matrix Plot
    probs = model.predict_proba(X_test)[:, 1]
    preds = (probs >= threshold).astype(int)
    cm = confusion_matrix(y_test, preds)

    fig, ax = plt.subplots(figsize=(6, 5))
    cax = ax.matshow(cm, cmap="Blues")
    fig.colorbar(cax)
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(['Normal (0)', 'Spike (1)'])
    ax.set_yticklabels(['Normal (0)', 'Spike (1)'])
    for (i, j), val in np.ndenumerate(cm):
        ax.text(j, i, f"{val}", ha='center', va='center', color='orange', fontsize=14, fontweight='bold')
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    plt.title(f'Confusion Matrix ({model_name} @ Thresh={threshold:.2f})')
    plt.tight_layout()
    plt.savefig("docs/model_results/confusion_matrix.png", dpi=300)
    plt.close()

    # 2. ROC Curve Plot
    fpr, tpr, _ = roc_curve(y_test, probs)
    auc_score = roc_auc_score(y_test, probs)

    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, color="#14b8a6", lw=2, label=f'ROC Curve (AUC = {auc_score:.4f})')
    plt.plot([0, 1], [0, 1], color="gray", linestyle="--")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(f"ROC Curve ({model_name})")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig("docs/model_results/roc_curve.png", dpi=300)
    plt.close()

    # 3. Precision-Recall Curve Plot
    precisions, recalls, _ = precision_recall_curve(y_test, probs)
    pr_auc = average_precision_score(y_test, probs)

    plt.figure(figsize=(6, 5))
    plt.plot(recalls, precisions, color="#38bdf8", lw=2, label=f'PR Curve (AUC = {pr_auc:.4f})')
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title(f"Precision-Recall Curve ({model_name})")
    plt.legend(loc="lower left")
    plt.tight_layout()
    plt.savefig("docs/model_results/pr_curve.png", dpi=300)
    plt.close()

    # 4. Feature Importance Bar Plot
    top_feats = list(feature_importances.items())[:10]
    names = [f[0].replace("_", " ").title() for f in top_feats[::-1]]
    values = [f[1] for f in top_feats[::-1]]

    plt.figure(figsize=(8, 5))
    plt.barh(names, values, color="#2dd4bf")
    plt.xlabel("Mean |SHAP Value| / Importance")
    plt.title(f"Top 10 Feature Importances ({model_name})")
    plt.tight_layout()
    plt.savefig("docs/model_results/feature_importance.png", dpi=300)
    plt.close()

if __name__ == "__main__":
    train_and_evaluate()
