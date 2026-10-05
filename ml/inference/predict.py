import os
import json
import joblib
import numpy as np
import pandas as pd
import shap

MODEL_PATH = "models/glucose_spike_model.joblib"
SCALER_PATH = "models/scaler.joblib"
METRICS_PATH = "models/metrics.json"
FEATURE_NAMES_PATH = "models/feature_names.json"

class SpikePredictor:
    def __init__(self):
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model artifact not found at {MODEL_PATH}")
        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)
        with open(FEATURE_NAMES_PATH, "r") as f:
            self.feature_names = json.load(f)
        with open(METRICS_PATH, "r") as f:
            self.metrics = json.load(f)
        
        # Frozen tuned classification threshold
        self.threshold = float(self.metrics.get("selected_threshold", 0.55))
        
        # Initialize SHAP explainer
        try:
            self.explainer = shap.TreeExplainer(self.model)
        except Exception:
            self.explainer = None

    def predict(self, feature_dict):
        """
        Inference function that receives a dictionary of features matching self.feature_names.
        Does NOT retrain the model.
        Returns structured dictionary.
        """
        # Ensure feature vector matches trained schema ordering
        df_feat = pd.DataFrame([feature_dict])[self.feature_names]
        
        # Predict probability
        if hasattr(self.model, "predict_proba"):
            prob = float(self.model.predict_proba(df_feat)[0, 1])
        else:
            prob = float(self.model.predict(df_feat)[0])

        # Risk classification based on frozen threshold
        is_spike_predicted = bool(prob >= self.threshold)
        
        if prob < (self.threshold * 0.60):
            risk_level = "Low"
        elif prob < self.threshold:
            risk_level = "Moderate"
        else:
            risk_level = "High"

        # Compute SHAP feature attributions
        top_factors = []
        shap_dict = {}
        
        if self.explainer:
            try:
                s_vals = self.explainer.shap_values(df_feat)
                if isinstance(s_vals, list):
                    s_vals = s_vals[1]
                s_row = s_vals[0]

                for name, val, feat_val in zip(self.feature_names, s_row, df_feat.iloc[0]):
                    shap_dict[name] = float(val)

                # Sort by absolute SHAP impact
                sorted_factors = sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)
                for name, impact in sorted_factors[:5]:
                    val = float(df_feat.iloc[0][name])
                    direction = "increases risk" if impact > 0 else "reduces risk"
                    readable_name = name.replace("_", " ").title()
                    top_factors.append({
                        "feature": name,
                        "readable_name": readable_name,
                        "value": val,
                        "impact": round(float(impact), 4),
                        "direction": direction,
                        "explanation": f"{readable_name} ({val:.1f}) {direction} by {abs(impact):.2f}"
                    })
            except Exception as e:
                print(f"SHAP calculation fallback: {e}")

        if not top_factors:
            # Fallback to model feature importances
            feat_imp = self.metrics.get("feature_importances", {})
            for name, imp in list(feat_imp.items())[:5]:
                val = float(df_feat.iloc[0].get(name, 0.0))
                top_factors.append({
                    "feature": name,
                    "readable_name": name.replace("_", " ").title(),
                    "value": val,
                    "impact": round(float(imp), 4),
                    "direction": "influences risk",
                    "explanation": f"{name.replace('_', ' ').title()} is a key predictive factor."
                })

        return {
            "risk_probability": round(prob, 4),
            "risk_percentage": round(prob * 100, 1),
            "risk_level": risk_level,
            "is_spike_predicted": is_spike_predicted,
            "prediction_horizon": "Approximately 2 hours",
            "threshold": round(self.threshold, 4),
            "top_factors": top_factors,
            "shap_values": shap_dict
        }

_predictor = None

def get_predictor():
    global _predictor
    if _predictor is None:
        _predictor = SpikePredictor()
    return _predictor

def predict_patient_risk(features):
    predictor = get_predictor()
    return predictor.predict(features)
