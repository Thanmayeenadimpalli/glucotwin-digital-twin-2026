# GlucoTwin — Competition Slide Deck Outline

## Slide 1: Title & Vision
- **Header**: GlucoTwin — AI Digital Twin for Early Prediction of Glucose Spikes
- **Subtitle**: Happiest Health Digital Twin Challenge 2026
- **Tagline**: Proactive, Continuous Glucose Spike Forecasting via EHR + Wearable IoT Data Fusion

## Slide 2: The Healthcare Challenge
- Type 2 Diabetes affects over 500 million individuals globally.
- Standard HbA1c labs reflect 3-month retrospective averages.
- Traditional CGM alarms are reactive — triggering only after a spike has occurred.
- Need: Proactive early prediction ~2 hours ahead to enable lifestyle intervention.

## Slide 3: The Digital Twin Solution
- Continuous virtual representation of patient physiology.
- **Static EHR Layer**: Age, BMI, HbA1c, Fasting Glucose, History.
- **Dynamic Telemetry Layer**: Heart Rate, Steps, Sleep, Stress, Carbs.
- Fusion engine maintains live state and feeds temporal ML predictor.

## Slide 4: System Architecture & Data Flow
- Data Generation (50 synthetic patients, 16,800 records).
- Feature Fusion & Sliding Window Dynamics (3h/6h rolling stats).
- XGBoost Classifier (2-Hour Horizon Target Definition: $\ge 180$ mg/dL or $+40$ jump).

## Slide 5: Machine Learning Results
- **ROC-AUC**: 0.9027
- **PR-AUC**: 0.6239
- **Recall (Spike Sensitivity)**: 91.08%
- **F1 Score**: 0.6280
- Evaluated on group-split unseen patient test sets.

## Slide 6: Explainability & SHAP Attributions
- SHAP feature contribution breakdown for every prediction.
- Clear human-readable non-clinical explanations for doctor dashboard.

## Slide 7: Interactive Counterfactual Simulator
- Allows testing lifestyle scenarios (e.g. increase steps, lower carbs, improve sleep).
- Live calculation of risk deltas and counterfactual outcomes.

## Slide 8: Safety, Compliance & Next Steps
- 100% Synthetic Data & Anonymized Profiles.
- Explicit Medical Disclaimer & Educational Scope.
- Future work: Integration with wearable APIs (Apple HealthKit, Fitbit, Dexcom).
