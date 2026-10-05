import json
import os
import pandas as pd
from flask import Blueprint, jsonify, request
from backend.digital_twin.twin_engine import DigitalTwin, get_digital_twin_snapshot

api_bp = Blueprint("api", __name__)

EHR_PATH = "data/synthetic_ehr.csv"
WEARABLE_PATH = "data/synthetic_wearable.csv"
GLUCOSE_PATH = "data/synthetic_glucose.csv"
METRICS_PATH = "models/metrics.json"

@api_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "GlucoTwin Digital Twin API",
        "version": "1.0.0",
        "timestamp": pd.Timestamp.now().isoformat()
    }), 200

@api_bp.route("/metrics", methods=["GET"])
def get_ml_metrics():
    if not os.path.exists(METRICS_PATH):
        return jsonify({"error": "ML model metrics not found"}), 404
    with open(METRICS_PATH, "r") as f:
        metrics = json.load(f)
    return jsonify(metrics), 200

@api_bp.route("/patients", methods=["GET"])
def list_patients():
    if not os.path.exists(EHR_PATH):
        return jsonify({"error": "EHR dataset not found"}), 404
    df_ehr = pd.read_csv(EHR_PATH)
    patients = []
    for _, row in df_ehr.iterrows():
        pid = row["patient_id"]
        try:
            snapshot = get_digital_twin_snapshot(pid)
            risk_level = snapshot["prediction"]["risk_level"]
            risk_prob = snapshot["prediction"]["risk_percentage"]
        except Exception:
            risk_level = "Unknown"
            risk_prob = 0.0

        patients.append({
            "patient_id": pid,
            "name": row["name"],
            "age": row["age"],
            "sex": row["sex"],
            "bmi": row["bmi"],
            "hba1c": row["hba1c"],
            "fasting_glucose": row["fasting_glucose"],
            "activity_level_baseline": row["activity_level_baseline"],
            "risk_level": risk_level,
            "risk_percentage": risk_prob
        })
    return jsonify({"patients": patients, "count": len(patients)}), 200

@api_bp.route("/patients/<patient_id>", methods=["GET"])
def get_patient_profile(patient_id):
    if not os.path.exists(EHR_PATH):
        return jsonify({"error": "EHR dataset not found"}), 404
    df_ehr = pd.read_csv(EHR_PATH)
    p = df_ehr[df_ehr["patient_id"] == patient_id]
    if p.empty:
        return jsonify({"error": f"Patient '{patient_id}' not found"}), 404
    patient_dict = p.iloc[0].to_dict()
    return jsonify(patient_dict), 200

@api_bp.route("/digital-twin/<patient_id>", methods=["GET"])
def get_digital_twin_state(patient_id):
    timestamp_param = request.args.get("timestamp")
    try:
        snapshot = get_digital_twin_snapshot(patient_id, timestamp_str=timestamp_param)
        return jsonify(snapshot), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to compute Digital Twin state: {str(e)}"}), 500

@api_bp.route("/wearables/<patient_id>", methods=["GET"])
def get_wearable_series(patient_id):
    if not os.path.exists(WEARABLE_PATH):
        return jsonify({"error": "Wearable dataset not found"}), 404
    df_w = pd.read_csv(WEARABLE_PATH)
    pw = df_w[df_w["patient_id"] == patient_id].sort_values("timestamp")
    if pw.empty:
        return jsonify({"error": f"No wearable data found for patient '{patient_id}'"}), 404
    records = pw.to_dict(orient="records")
    return jsonify({"patient_id": patient_id, "wearable_series": records, "count": len(records)}), 200

@api_bp.route("/glucose/<patient_id>", methods=["GET"])
def get_glucose_series(patient_id):
    if not os.path.exists(GLUCOSE_PATH):
        return jsonify({"error": "Glucose dataset not found"}), 404
    df_g = pd.read_csv(GLUCOSE_PATH)
    pg = df_g[df_g["patient_id"] == patient_id].sort_values("timestamp")
    if pg.empty:
        return jsonify({"error": f"No glucose data found for patient '{patient_id}'"}), 404
    records = pg.to_dict(orient="records")
    return jsonify({"patient_id": patient_id, "glucose_series": records, "count": len(records)}), 200

@api_bp.route("/digital-twin/simulate", methods=["POST"])
def simulate_digital_twin():
    data = request.get_json() or {}
    patient_id = data.get("patient_id", "GT-001")
    simulations = data.get("simulations", {})

    try:
        twin = DigitalTwin(patient_id)
        baseline_state = twin.get_snapshot()
        simulated_state = twin.get_snapshot(simulation_override=simulations)

        base_prob = baseline_state["prediction"]["risk_percentage"]
        sim_prob = simulated_state["prediction"]["risk_percentage"]
        prob_delta = round(sim_prob - base_prob, 1)

        return jsonify({
            "patient_id": patient_id,
            "disclaimer": "Simulation only — research proof-of-concept. Not clinical advice.",
            "baseline": {
                "risk_level": baseline_state["prediction"]["risk_level"],
                "risk_percentage": base_prob,
                "current_glucose": baseline_state["current_vitals"]["glucose_mgdl"],
                "steps": baseline_state["current_vitals"]["steps"],
                "sleep_hours": baseline_state["current_vitals"]["sleep_hours_last_night"],
                "carbs_intake_g": baseline_state["current_vitals"]["carbs_intake_g"],
                "stress_level": baseline_state["current_vitals"]["stress_level"]
            },
            "simulated": {
                "risk_level": simulated_state["prediction"]["risk_level"],
                "risk_percentage": sim_prob,
                "current_glucose": simulated_state["current_vitals"]["glucose_mgdl"],
                "steps": simulated_state["current_vitals"]["steps"],
                "sleep_hours": simulated_state["current_vitals"]["sleep_hours_last_night"],
                "carbs_intake_g": simulated_state["current_vitals"]["carbs_intake_g"],
                "stress_level": simulated_state["current_vitals"]["stress_level"]
            },
            "comparison": {
                "risk_percentage_change": prob_delta,
                "direction": "Decreased" if prob_delta < 0 else ("Increased" if prob_delta > 0 else "Unchanged"),
                "simulated_top_factors": simulated_state["prediction"]["top_factors"]
            },
            "full_simulated_state": simulated_state
        }), 200

    except Exception as e:
        return jsonify({"error": f"Simulation execution error: {str(e)}"}), 500

@api_bp.route("/predictions/<patient_id>", methods=["GET"])
def get_prediction_history(patient_id):
    if not os.path.exists("data/feature_dataset.csv"):
        return jsonify({"error": "Feature dataset not found"}), 404
    df_feat = pd.read_csv("data/feature_dataset.csv")
    pf = df_feat[df_feat["patient_id"] == patient_id].sort_values("timestamp")
    if pf.empty:
        return jsonify({"error": f"No prediction history for patient '{patient_id}'"}), 404

    history = []
    for _, row in pf.tail(20).iterrows():
        actual_spike = int(row["future_glucose_spike_2h"])
        history.append({
            "timestamp": row["timestamp"],
            "current_glucose": row["current_glucose"],
            "carbs_2h": row["carbs_sum_2h"],
            "steps_3h": row["steps_sum_3h"],
            "actual_outcome_2h_spike": actual_spike,
            "actual_label": "Glucose Spike Observed" if actual_spike == 1 else "Normal Range"
        })

    return jsonify({"patient_id": patient_id, "history": history, "count": len(history)}), 200

@api_bp.route("/explainability/<patient_id>", methods=["GET"])
def get_explainability(patient_id):
    try:
        snapshot = get_digital_twin_snapshot(patient_id)
        pred = snapshot["prediction"]

        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r") as f:
                metrics_data = json.load(f)
            global_importances = metrics_data.get("feature_importances", {})
        else:
            global_importances = {}

        return jsonify({
            "patient_id": patient_id,
            "patient_name": snapshot["name"],
            "current_prediction": pred,
            "shap_values": pred.get("shap_values", {}),
            "top_contributing_factors": pred.get("top_factors", []),
            "global_feature_importances": global_importances,
            "human_readable_summary": f"For {snapshot['name']}, recent glucose trend ({snapshot['recent_glucose_trend']['current']} mg/dL) and carb intake contributed to a {pred['risk_percentage']}% predicted 2-hour glucose spike risk."
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/reports/<patient_id>", methods=["GET"])
def get_patient_report(patient_id):
    try:
        snapshot = get_digital_twin_snapshot(patient_id)
        
        with open(METRICS_PATH, "r") as f:
            metrics_data = json.load(f)

        report = {
            "report_id": f"REP-{patient_id}-2026",
            "generated_at": pd.Timestamp.now().isoformat(),
            "disclaimer": "GlucoTwin Digital Twin Proof-of-Concept. NOT FOR CLINICAL DIAGNOSIS OR DIRECT MEDICAL DECISIONS.",
            "patient_profile": snapshot["demographics"],
            "medical_history": snapshot["medical_history"],
            "current_digital_twin_status": {
                "risk_level": snapshot["prediction"]["risk_level"],
                "risk_percentage": snapshot["prediction"]["risk_percentage"],
                "current_glucose": snapshot["current_vitals"]["glucose_mgdl"],
                "heart_rate": snapshot["current_vitals"]["heart_rate"],
                "steps": snapshot["current_vitals"]["steps"],
                "sleep": snapshot["current_vitals"]["sleep_hours_last_night"]
            },
            "top_predictive_factors": snapshot["prediction"]["top_factors"],
            "ml_model_context": {
                "model_type": metrics_data.get("best_model_name", "XGBoost"),
                "f1_score": metrics_data.get("best_model_metrics", {}).get("f1"),
                "roc_auc": metrics_data.get("best_model_metrics", {}).get("roc_auc"),
                "pr_auc": metrics_data.get("best_model_metrics", {}).get("pr_auc"),
                "accuracy": metrics_data.get("best_model_metrics", {}).get("accuracy")
            }
        }
        return jsonify(report), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
