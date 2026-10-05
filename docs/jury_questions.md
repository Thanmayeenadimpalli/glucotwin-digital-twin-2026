# GlucoTwin — Jury Questions & Technical Defense Guide

> **Happiest Health Digital Twin Challenge 2026**  
> *Detailed Technical Defense & Jury Q&A Answers*

---

### Q1: Why is this a Digital Twin and not just an ML model?
**Answer**: An ML model is a static function that takes input features and returns a prediction. In contrast, GlucoTwin maintains a continuous, stateful virtual representation of a patient by fusing multi-stream data (static EHR baseline + dynamic wearable IoT + continuous glucose monitoring) over time. The Digital Twin engine tracks metabolic dynamics, maintains temporal state snapshots, enables scenario counterfactual simulations, and passes the updated state to the predictive model.

### Q2: Why glucose-spike prediction?
**Answer**: Postprandial glucose spikes are major drivers of vascular complications, systemic inflammation, and HbA1c elevation in Type 2 Diabetes. Traditional CGM alerts are reactive—triggering *after* a spike has already occurred. Predicting spikes approximately 2 hours in advance provides an actionable window for non-clinical intervention (e.g., light physical activity or dietary adjustment).

### Q3: Why synthetic data?
**Answer**: Real Continuous Glucose Monitoring and EHR data contain highly sensitive Protected Health Information (PHI). For this research proof-of-concept, synthetic data generation guarantees 100% patient privacy, reproducible experiments via fixed random seeds, and known physiological relationships to benchmark ML models ethically.

### Q4: How are EHR and wearable data fused?
**Answer**: When a state query is made at timestamp $T$, the `DigitalTwin` engine loads the patient's static EHR vector (Age, Sex, BMI, HbA1c, Fasting Glucose, Medical History) and concatenates it with temporal summary statistics computed from the preceding 6 hours of wearable IoT and CGM time-series data up to $T$.

### Q5: How do you prevent data leakage?
**Answer**: 
1. **Temporal Scoping**: Features at index $t$ strictly use historical data $\le t$. Target variable evaluates future indices $t+1$ and $t+2$.
2. **Patient-Aware Split**: Train/test splitting uses `GroupShuffleSplit` by `patient_id` (40 train patients, 10 test patients, 0 patient overlap).

### Q6: How do you predict two hours ahead?
**Answer**: Sampling frequency is 1 hour per step. At timestamp $t$, the binary classification target evaluates $\max(\text{Glucose}_{t+1}, \text{Glucose}_{t+2}) \ge 180 \text{ mg/dL}$ or a jump $\ge 40 \text{ mg/dL}$. This forecasts glucose spike occurrence across the 1-hour and 2-hour forward window.

### Q7: How is the model validated?
**Answer**: Candidate models (Logistic Regression, Random Forest, XGBoost) were trained on 40 patients. Classification thresholds were optimized using 5-fold GroupKFold cross-validation on the training set only. The final XGBoost model and frozen 0.55 threshold were evaluated once on 10 held-out unseen test patients.

### Q8: What are the actual model metrics?
**Answer**: Evaluated on the held-out test set (3,280 sample rows, 10 test patients):
- **ROC-AUC**: `0.9027`
- **PR-AUC**: `0.6239`
- **Recall (Sensitivity)**: `87.04%` (517 True Positives / 594 actual spikes)
- **Precision**: `50.00%`
- **F1-Score**: `0.6351`
- **Accuracy**: `81.89%`

### Q9: Why use SHAP?
**Answer**: SHAP (SHapley Additive exPlanations) provides game-theoretic additive feature attributions. It explains individual predictions by calculating how much each physiological feature (e.g. 4h carb intake sum, 3h step sum, recent glucose slope) contributed to shifting the prediction from the baseline expectation.

### Q10: How does the simulation work?
**Answer**: The Digital Twin counterfactual simulator allows a user to modify specific input variables (e.g. increasing steps from 1,500 to 8,000). The engine creates a modified state vector at index $t$ and passes it through the exact same trained XGBoost model to calculate the new predicted probability and risk delta in real time.

### Q11: Can this be used clinically?
**Answer**: No. GlucoTwin is a research/competition proof-of-concept using synthetic data. It is not clinically validated and is explicitly labeled as not intended for diagnosis, treatment, or medical decision-making.

### Q12: What are the limitations?
**Answer**: 
1. Synthetic dataset may not capture all real-world physiological edge cases.
2. Hourly time step resolution is coarser than 5-minute Dexcom CGM data.
3. Model is trained on population-level synthetic distributions rather than individual-level longitudinal calibration.

### Q13: What happens with missing wearable data?
**Answer**: In a production deployment, forward imputation or missing-data flags would be utilized. In our synthetic data pipeline, strict validation asserts 0 missing values across all datasets.

### Q14: How would this scale to real-world data?
**Answer**: By building ingestion connectors for Apple HealthKit, Fitbit API, and Dexcom API, real-time streaming data would feed into the same `DigitalTwin` feature fusion engine.

### Q15: How would you validate it clinically?
**Answer**: A prospective observational study pairing patients with real CGMs and wearables over 30 days to measure real-world sensitivity, specificity, and false alert burden, followed by an IRB-approved clinical trial.

### Q16: How would patient privacy be handled?
**Answer**: End-to-end encryption in transit (HTTPS/TLS) and at rest, HIPAA-compliant cloud storage (GCP Healthcare API), de-identification of telemetry streams, and strict access control RBAC.

### Q17: What happens if the model is wrong?
**Answer**: False Positives (over-alerting) prompt harmless precautionary actions like light walking. False Negatives (missed spikes) are mitigated by setting a high-recall classification threshold (87.04% sensitivity) so spike detection is prioritized.

### Q18: What is the most innovative component?
**Answer**: Fusing multi-stream static EHR and dynamic IoT data into a stateful Digital Twin with live counterfactual simulation capabilities—allowing clinicians to test "what-if" lifestyle interventions interactively.

### Q19: What would you build next?
**Answer**: 
1. Higher frequency 5-minute CGM telemetry ingestion.
2. Personalized continuous online learning per patient.
3. Mobile app companion with push notifications.

### Q20: Why should healthcare organizations care?
**Answer**: Proactive early prediction shifts diabetes management from reactive crisis response to proactive behavioral coaching, reducing long-term metabolic complications and hospital readmissions.
