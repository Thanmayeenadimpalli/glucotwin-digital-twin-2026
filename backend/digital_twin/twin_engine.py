import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime

# Ensure project root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.inference.predict import predict_patient_risk

EHR_PATH = "data/synthetic_ehr.csv"
WEARABLE_PATH = "data/synthetic_wearable.csv"
GLUCOSE_PATH = "data/synthetic_glucose.csv"

class DigitalTwin:
    def __init__(self, patient_id):
        self.patient_id = patient_id
        self._load_patient_data()

    def _load_patient_data(self):
        # Load EHR
        if not os.path.exists(EHR_PATH):
            raise FileNotFoundError(f"EHR dataset not found at {EHR_PATH}")
        df_ehr = pd.read_csv(EHR_PATH)
        patient_ehr = df_ehr[df_ehr["patient_id"] == self.patient_id]
        if patient_ehr.empty:
            raise ValueError(f"Patient ID '{self.patient_id}' not found in database.")
        self.ehr = patient_ehr.iloc[0].to_dict()

        # Load Wearables & Glucose
        df_w = pd.read_csv(WEARABLE_PATH)
        df_g = pd.read_csv(GLUCOSE_PATH)

        pw = df_w[df_w["patient_id"] == self.patient_id].sort_values("timestamp")
        pg = df_g[df_g["patient_id"] == self.patient_id].sort_values("timestamp")

        if pw.empty or pg.empty:
            raise ValueError(f"No wearable or glucose data for patient '{self.patient_id}'")

        self.wearable_df = pw.reset_index(drop=True)
        self.glucose_df = pg.reset_index(drop=True)

    def build_feature_vector_at_time(self, timestamp_str=None, simulation_override=None):
        """
        Calculates feature vector using data strictly <= timestamp_str.
        Prevents future data leakage.
        """
        w_df = self.wearable_df.copy()
        g_df = self.glucose_df.copy()

        # Filter time <= timestamp_str if specified
        if timestamp_str:
            w_df = w_df[w_df["timestamp"] <= timestamp_str]
            g_df = g_df[g_df["timestamp"] <= timestamp_str]

        if len(w_df) < 6 or len(g_df) < 6:
            raise ValueError(f"Insufficient history prior to timestamp {timestamp_str} (requires at least 6 hours history).")

        w_records = w_df.to_dict(orient="records")
        g_records = g_df.to_dict(orient="records")

        # Handle simulation overrides for latest record
        if simulation_override:
            latest_w = dict(w_records[-1])
            latest_g = dict(g_records[-1])

            if "steps" in simulation_override:
                latest_w["steps"] = float(simulation_override["steps"])
            if "sleep_hours_last_night" in simulation_override:
                latest_w["sleep_hours_last_night"] = float(simulation_override["sleep_hours_last_night"])
            if "carbs_intake_g" in simulation_override:
                latest_w["carbs_intake_g"] = float(simulation_override["carbs_intake_g"])
            if "stress_level" in simulation_override:
                latest_w["stress_level"] = float(simulation_override["stress_level"])
            if "heart_rate" in simulation_override:
                latest_w["heart_rate"] = float(simulation_override["heart_rate"])

            if "current_glucose" in simulation_override:
                latest_g["glucose_mgdl"] = float(simulation_override["current_glucose"])

            w_records[-1] = latest_w
            g_records[-1] = latest_g

        # Take last 6 available historical records up to prediction time T
        recent_w = w_records[-6:]
        recent_g = g_records[-6:]

        g_vals = [r["glucose_mgdl"] for r in recent_g]
        hr_vals = [r["heart_rate"] for r in recent_w]
        step_vals = [r["steps"] for r in recent_w]
        carb_vals = [r.get("carbs_intake_g", 0.0) for r in recent_w]
        stress_vals = [r.get("stress_level", 3) for r in recent_w]

        curr_g = g_vals[-1]
        g_mean_3h = float(np.mean(g_vals[-3:]))
        g_std_3h = float(np.std(g_vals[-3:]))
        g_slope_3h = float((g_vals[-1] - g_vals[-3]) / 2.0) if len(g_vals) >= 3 else 0.0

        carbs_sum_2h = float(np.sum(carb_vals[-2:]))
        carbs_sum_4h = float(np.sum(carb_vals[-4:]))

        steps_sum_3h = float(np.sum(step_vals[-3:]))
        steps_sum_6h = float(np.sum(step_vals))

        hr_mean_3h = float(np.mean(hr_vals[-3:]))
        stress_mean_3h = float(np.mean(stress_vals[-3:]))
        sleep_hours = float(recent_w[-1].get("sleep_hours_last_night", 7.0))

        features = {
            "current_glucose": curr_g,
            "glucose_mean_3h": g_mean_3h,
            "glucose_std_3h": g_std_3h,
            "glucose_slope_3h": g_slope_3h,
            "carbs_sum_2h": carbs_sum_2h,
            "carbs_sum_4h": carbs_sum_4h,
            "steps_sum_3h": steps_sum_3h,
            "steps_sum_6h": steps_sum_6h,
            "hr_mean_3h": hr_mean_3h,
            "stress_mean_3h": stress_mean_3h,
            "sleep_hours_last_night": sleep_hours,
            "age": int(self.ehr["age"]),
            "sex": 1 if self.ehr["sex"] == "M" else 0,
            "bmi": float(self.ehr["bmi"]),
            "hba1c": float(self.ehr["hba1c"]),
            "fasting_glucose": float(self.ehr["fasting_glucose"]),
            "hypertension": int(self.ehr["hypertension"]),
            "family_history_diabetes": int(self.ehr["family_history_diabetes"]),
            "activity_level_baseline": 2 if self.ehr["activity_level_baseline"] == "Active" else (1 if self.ehr["activity_level_baseline"] == "Moderate" else 0)
        }

        return features, recent_w[-1], recent_g[-1], w_records[-24:], g_records[-24:]

    def get_snapshot(self, timestamp_str=None, simulation_override=None):
        """
        Generates full Digital Twin snapshot at target timestamp T.
        """
        features, latest_w, latest_g, recent_w_24, recent_g_24 = self.build_feature_vector_at_time(
            timestamp_str=timestamp_str,
            simulation_override=simulation_override
        )

        # Call trained ML model predictor
        prediction = predict_patient_risk(features)

        ts = latest_g.get("timestamp", timestamp_str or datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        return {
            "patient_id": self.patient_id,
            "name": self.ehr.get("name", f"Patient {self.patient_id}"),
            "timestamp": ts,
            "demographics": {
                "age": int(self.ehr["age"]),
                "sex": self.ehr["sex"],
                "bmi": float(self.ehr["bmi"]),
                "hba1c": float(self.ehr["hba1c"]),
                "fasting_glucose": float(self.ehr["fasting_glucose"])
            },
            "medical_history": {
                "hypertension": bool(self.ehr["hypertension"]),
                "family_history_diabetes": bool(self.ehr["family_history_diabetes"]),
                "smoking_status": self.ehr["smoking_status"]
            },
            "lifestyle": {
                "activity_level_baseline": self.ehr["activity_level_baseline"]
            },
            "current_vitals": {
                "glucose_mgdl": float(latest_g.get("glucose_mgdl", 100.0)),
                "heart_rate": float(latest_w.get("heart_rate", 72.0)),
                "steps": int(latest_w.get("steps", 0)),
                "sleep_hours_last_night": float(latest_w.get("sleep_hours_last_night", 7.0)),
                "stress_level": int(latest_w.get("stress_level", 3)),
                "calories_burned": float(latest_w.get("calories_burned", 80.0)),
                "carbs_intake_g": float(latest_w.get("carbs_intake_g", 0.0))
            },
            "recent_glucose_trend": {
                "current": features["current_glucose"],
                "mean_3h": round(features["glucose_mean_3h"], 1),
                "std_3h": round(features["glucose_std_3h"], 1),
                "slope_3h": round(features["glucose_slope_3h"], 2)
            },
            "prediction": prediction,
            "data_source_status": {
                "ehr_synced": True,
                "wearable_connected": True,
                "cgm_active": True,
                "last_sync": ts
            },
            "recent_24h_history": {
                "wearable": recent_w_24,
                "glucose": recent_g_24
            }
        }

def get_digital_twin(patient_id):
    return DigitalTwin(patient_id)

def get_digital_twin_snapshot(patient_id, timestamp_str=None):
    twin = DigitalTwin(patient_id)
    return twin.get_snapshot(timestamp_str=timestamp_str)
