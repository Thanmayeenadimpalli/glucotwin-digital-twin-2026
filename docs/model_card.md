# Model Card — GlucoTwin 2-Hour Glucose Spike Classifier

> **Happiest Health Digital Twin Challenge 2026**  
> *Competition & Research Proof-of-Concept Model Specification*

---

## 1. Model Details
- **Model Name**: GlucoTwin XGBoost Glucose Spike Classifier
- **Model Type**: Gradient Boosted Decision Trees (`XGBClassifier`)
- **Framework**: `xgboost` (v3.4.1), `scikit-learn` (v1.7.2), `shap` (v0.52.0)
- **Model Artifact**: `models/glucose_spike_model.joblib`
- **Tuned Threshold**: `0.55` (Tuned on 5-fold GroupKFold Train Cross-Validation)

---

## 2. Intended Use & Clinical Scope
- **Intended Use**: Proactive 2-hour early prediction of significant glucose spikes ($\ge 180 \text{ mg/dL}$ or $\ge 40 \text{ mg/dL}$ jump) for interactive digital twin research and educational scenario simulation.
- **Non-Intended Use**: Direct clinical diagnosis, automatic insulin dosing, or clinical treatment decisions.
- **Mandatory Disclaimer**:  
  > *"This is a competition/research proof-of-concept and is not clinically validated or intended for diagnosis or treatment."*

---

## 3. Dataset & Data Leakage Safeguards
- **Synthetic Dataset**: 50 anonymized patient profiles, 16,800 wearable IoT & CGM records over 14 continuous days.
- **Feature Windowing**: All 19 input features at time $t$ use strictly historical data up to index $t$.
- **Target Definition**: Binary target evaluating future glucose window $[t+1, t+2]$ (1h and 2h ahead).
- **Leakage Prevention**: Evaluated with a `GroupShuffleSplit` on 10 held-out test patients with **0 patient overlap** with the training set.

---

## 4. Evaluation Strategy & Test Set Metrics

### Patient-Aware Split
- **Training Set**: 40 Patients (13,120 observations)
- **Test Set**: 10 Patients (3,280 observations)
- **Patient Overlap**: `0`

### Test Set Performance (Frozen Threshold = 0.55)

| Metric | Measured Test Value |
| :--- | :---: |
| **Accuracy** | `81.89%` |
| **Precision** | `50.00%` |
| **Recall (Sensitivity)** | **`87.04%`** |
| **F1-Score** | **`0.6351`** |
| **ROC-AUC** | **`0.9027`** |
| **PR-AUC** | **`0.6239`** |

### Confusion Matrix Breakdown (Test Set)
- **True Positives (TP)**: `517` (Correctly flagged glucose spikes)
- **True Negatives (TN)**: `2,169` (Correctly identified normal glucose ranges)
- **False Positives (FP)**: `517` (Early warning alerts)
- **False Negatives (FN)**: `77` (Missed spikes)

---

## 5. Candidate Model Comparison

| Model Architecture | Precision | Recall | F1-Score | ROC-AUC | PR-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression (Baseline) | 0.3098 | 0.7172 | 0.4327 | 0.7468 | 0.3930 |
| Random Forest Classifier | 0.5298 | 0.7340 | 0.6154 | 0.8842 | 0.5807 |
| **XGBoost Classifier (Selected)** | **0.5000** | **0.8704** | **0.6351** | **0.9027** | **0.6239** |

---

## 6. Top Important Features (Mean SHAP Value)
1. `glucose_slope_3h`: 3-Hour glucose trend slope
2. `current_glucose`: Glucose level at prediction time $t$
3. `carbs_sum_2h`: Accumulated carbohydrate intake over past 2 hours
4. `glucose_mean_3h`: 3-Hour rolling average glucose
5. `steps_sum_3h`: 3-Hour physical activity step count

---

## 7. Limitations & Reproducibility
- Data is synthetic; clinical performance on real human physiological data may differ.
- Reproducible via `python scripts/train_model.py` with fixed random seed `seed=42`.
