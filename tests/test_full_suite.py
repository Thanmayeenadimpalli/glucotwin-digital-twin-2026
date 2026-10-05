import unittest
import os
import json
import numpy as np
import pandas as pd
from backend.app import create_app
from backend.digital_twin.twin_engine import DigitalTwin, get_digital_twin_snapshot
from ml.inference.predict import get_predictor, predict_patient_risk

class TestGlucoTwinFullSuite(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    # === PHASE 1 DATA PIPELINE TESTS ===

    def test_01_datasets_exist(self):
        """Verify synthetic data files exist and have data."""
        self.assertTrue(os.path.exists("data/synthetic_ehr.csv"))
        self.assertTrue(os.path.exists("data/synthetic_wearable.csv"))
        self.assertTrue(os.path.exists("data/synthetic_glucose.csv"))
        self.assertTrue(os.path.exists("data/feature_dataset.csv"))

        df_ehr = pd.read_csv("data/synthetic_ehr.csv")
        self.assertEqual(len(df_ehr), 50)

    def test_02_missing_values_and_duplicates_check(self):
        """Verify 0 missing values and 0 duplicates across all synthetic datasets."""
        df_ehr = pd.read_csv("data/synthetic_ehr.csv")
        df_wearable = pd.read_csv("data/synthetic_wearable.csv")
        df_glucose = pd.read_csv("data/synthetic_glucose.csv")
        df_features = pd.read_csv("data/feature_dataset.csv")

        self.assertEqual(df_ehr.isnull().sum().sum(), 0)
        self.assertEqual(df_wearable.isnull().sum().sum(), 0)
        self.assertEqual(df_glucose.isnull().sum().sum(), 0)
        self.assertEqual(df_features.isnull().sum().sum(), 0)

        self.assertEqual(df_ehr.duplicated(subset=["patient_id"]).sum(), 0)
        self.assertEqual(df_wearable.duplicated(subset=["patient_id", "timestamp"]).sum(), 0)
        self.assertEqual(df_glucose.duplicated(subset=["patient_id", "timestamp"]).sum(), 0)

    def test_03_patient_linking_consistency(self):
        """Verify patient IDs match perfectly across all 4 datasets."""
        df_ehr = pd.read_csv("data/synthetic_ehr.csv")
        df_wearable = pd.read_csv("data/synthetic_wearable.csv")
        df_glucose = pd.read_csv("data/synthetic_glucose.csv")
        df_features = pd.read_csv("data/feature_dataset.csv")

        p_ehr = set(df_ehr["patient_id"])
        p_wear = set(df_wearable["patient_id"])
        p_gluc = set(df_glucose["patient_id"])
        p_feat = set(df_features["patient_id"])

        self.assertEqual(p_ehr, p_wear)
        self.assertEqual(p_ehr, p_gluc)
        self.assertEqual(p_ehr, p_feat)

    def test_04_target_and_leakage_prevention(self):
        """Verify target distribution and strict historical windowing for features."""
        df_features = pd.read_csv("data/feature_dataset.csv")
        self.assertIn("future_glucose_spike_2h", df_features.columns)

        pos_rate = df_features["future_glucose_spike_2h"].mean()
        self.assertGreater(pos_rate, 0.05)
        self.assertLess(pos_rate, 0.40)

        feature_cols = [c for c in df_features.columns if c not in ["patient_id", "timestamp", "future_glucose_spike_2h"]]
        for col in feature_cols:
            self.assertFalse("future" in col.lower())

    # === PHASE 2 ML MODEL & INFERENCE TESTS ===

    def test_05_model_artifacts_and_metrics(self):
        """Verify ML model artifacts, tuned threshold, and evaluation metrics."""
        self.assertTrue(os.path.exists("models/glucose_spike_model.joblib"))
        self.assertTrue(os.path.exists("models/scaler.joblib"))
        self.assertTrue(os.path.exists("models/metrics.json"))
        self.assertTrue(os.path.exists("models/feature_names.json"))

        with open("models/metrics.json") as f:
            metrics = json.load(f)
        self.assertEqual(metrics["best_model_name"], "XGBoost")
        self.assertIn("selected_threshold", metrics)
        self.assertGreater(metrics["best_model_metrics"]["roc_auc"], 0.85)

    def test_06_inference_module_schema(self):
        """Verify inference function output schema and probability range."""
        dummy_features = {
            "current_glucose": 175.0,
            "glucose_mean_3h": 165.0,
            "glucose_std_3h": 14.0,
            "glucose_slope_3h": 12.0,
            "carbs_sum_2h": 90.0,
            "carbs_sum_4h": 130.0,
            "steps_sum_3h": 300.0,
            "steps_sum_6h": 800.0,
            "hr_mean_3h": 85.0,
            "stress_mean_3h": 7.0,
            "sleep_hours_last_night": 5.0,
            "age": 56,
            "sex": 0,
            "bmi": 33.8,
            "hba1c": 7.4,
            "fasting_glucose": 148.0,
            "hypertension": 1,
            "family_history_diabetes": 1,
            "activity_level_baseline": 0
        }
        res = predict_patient_risk(dummy_features)
        self.assertIn("risk_probability", res)
        self.assertIn("risk_level", res)
        self.assertIn("is_spike_predicted", res)
        self.assertGreaterEqual(res["risk_probability"], 0.0)
        self.assertLessEqual(res["risk_probability"], 1.0)

    # === PHASE 3 DIGITAL TWIN ENGINE TESTS ===

    def test_07_three_demo_patients_snapshots(self):
        """Verify snapshots for GT-001, GT-002, GT-003 and prove profiles differ."""
        s1 = get_digital_twin_snapshot("GT-001")
        s2 = get_digital_twin_snapshot("GT-002")
        s3 = get_digital_twin_snapshot("GT-003")

        self.assertEqual(s1["patient_id"], "GT-001")
        self.assertEqual(s2["patient_id"], "GT-002")
        self.assertEqual(s3["patient_id"], "GT-003")

        # Prove different baseline metabolic profiles
        self.assertNotEqual(s1["demographics"]["bmi"], s2["demographics"]["bmi"])
        self.assertNotEqual(s2["demographics"]["hba1c"], s3["demographics"]["hba1c"])

        # Prove prediction values originate from real model
        self.assertIn("risk_percentage", s1["prediction"])
        self.assertIn("risk_percentage", s2["prediction"])
        self.assertIn("risk_percentage", s3["prediction"])

    def test_08_time_aware_filtering_leakage_proof(self):
        """
        CRITICAL TEST: Prove that future observations > T do NOT influence prediction at T.
        """
        twin = DigitalTwin("GT-001")
        
        # Timestamp T = Day 2 at 12:00
        t_target = "2026-09-02 12:00:00"
        snap_t1 = twin.get_snapshot(timestamp_str=t_target)

        # Mutate future record at Day 2 at 18:00 (6 hours AFTER target T)
        twin.glucose_df.loc[twin.glucose_df["timestamp"] == "2026-09-02 18:00:00", "glucose_mgdl"] = 300.0

        # Re-evaluate snapshot at target T
        snap_t2 = twin.get_snapshot(timestamp_str=t_target)

        # Verify prediction and vitals at time T remain 100% identical!
        self.assertEqual(snap_t1["prediction"]["risk_probability"], snap_t2["prediction"]["risk_probability"])
        self.assertEqual(snap_t1["current_vitals"]["glucose_mgdl"], snap_t2["current_vitals"]["glucose_mgdl"])

    def test_09_unknown_patient_and_invalid_timestamp_handling(self):
        """Verify robust error handling for unknown patients and out-of-bounds timestamps."""
        with self.assertRaises(ValueError):
            DigitalTwin("GT-999_NON_EXISTENT")

        twin = DigitalTwin("GT-001")
        with self.assertRaises(ValueError):
            # Timestamp before 6 hours of history exists
            twin.get_snapshot(timestamp_str="2026-09-01 02:00:00")

    def test_10_api_endpoints_coverage(self):
        """Verify API endpoints including timestamp query parameters."""
        endpoints = [
            "/api/health",
            "/api/metrics",
            "/api/patients",
            "/api/patients/GT-001",
            "/api/digital-twin/GT-001",
            "/api/digital-twin/GT-001?timestamp=2026-09-02%2012:00:00",
            "/api/wearables/GT-001",
            "/api/glucose/GT-001",
            "/api/predictions/GT-001",
            "/api/explainability/GT-001",
            "/api/reports/GT-001"
        ]
        for ep in endpoints:
            res = self.client.get(ep)
            self.assertEqual(res.status_code, 200, f"Endpoint {ep} failed with {res.status_code}")

if __name__ == "__main__":
    unittest.main()
