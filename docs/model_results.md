# GlucoTwin — Machine Learning Experiment Results

> **Happiest Health Digital Twin Challenge 2026**  
> *Empirical Model Evaluation & Comparative Metrics Report*

---

## 1. Validation Strategy & Data Split
- **Dataset**: `data/feature_dataset.csv` (16,400 fused temporal feature rows).
- **Patient-Aware Split**: `GroupShuffleSplit` (80% train patients, 20% test patients).
  - **Training Patients**: `40` (13,120 sample observations)
  - **Test Patients**: `10` (3,280 sample observations)
  - **Patient Overlap**: `0` (Zero patient overlap between train and test sets)
- **Target Variable**: `future_glucose_spike_2h` ($\max(G_{t+1}, G_{t+2}) \ge 180 \text{ mg/dL}$ or $\Delta \ge 40 \text{ mg/dL}$)
- **Target Distribution**:
  - Training Set Positive Rate: `18.18%`
  - Test Set Positive Rate: `18.11%` (`594` positive spike instances, `2,686` negative normal instances)

---

## 2. Threshold Tuning Methodology
- Decision threshold optimization was conducted using **5-fold GroupKFold cross-validation strictly on the training set** to optimize F1-Score for the imbalanced positive target class (~18.1% positive rate).
- **Frozen Classification Threshold**: **`0.55`**
- The test set was evaluated **once** using the frozen model and frozen threshold to prevent threshold overfitting.

---

## 3. Actual Comparative Evaluation Results (Held-Out Test Set)

| Model Architecture | Precision | Recall (Sensitivity) | F1-Score | ROC-AUC | PR-AUC | Optimal Threshold |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Logistic Regression (Baseline) | 0.3098 | 0.7172 | 0.4327 | 0.7468 | 0.3930 | 0.55 |
| Random Forest Classifier | 0.5298 | 0.7340 | 0.6154 | 0.8842 | 0.5807 | 0.55 |
| **XGBoost Classifier (Selected)** | **0.5000** | **0.8704** | **0.6351** | **0.9027** | **0.6239** | **0.55** |

---

## 4. Selected Final Model Breakdown (XGBoost @ Threshold 0.55)

### Exact Confusion Matrix Metrics
- **True Positives (TP)**: `517`
- **True Negatives (TN)**: `2,169`
- **False Positives (FP)**: `517`
- **False Negatives (FN)**: `77`

### Performance Summary
- **Accuracy**: `81.89%`
- **Precision**: `50.00%`
- **Recall (Spike Sensitivity)**: `87.04%`
- **F1-Score**: `0.6351`
- **ROC-AUC**: `0.9027`
- **PR-AUC**: `0.6239`

---

## 5. Top 10 Feature Attributions (Mean |SHAP| Value)

| Feature | Feature Description | Mean SHAP Impact |
| :--- | :--- | :---: |
| `carbs_sum_4h` | 4-Hour accumulated carbohydrate intake | `0.8254` |
| `carbs_sum_2h` | 2-Hour accumulated carbohydrate intake | `0.5492` |
| `steps_sum_6h` | 6-Hour accumulated physical step count | `0.5118` |
| `steps_sum_3h` | 3-Hour accumulated physical step count | `0.4852` |
| `current_glucose` | Glucose level at prediction time $t$ | `0.4795` |
| `hr_mean_3h` | 3-Hour mean heart rate (bpm) | `0.3112` |
| `stress_mean_3h` | 3-Hour mean stress level indicator | `0.2235` |
| `hba1c` | Baseline HbA1c percentage | `0.2171` |
| `fasting_glucose` | Baseline fasting plasma glucose | `0.2085` |
| `bmi` | Body Mass Index (kg/m²) | `0.1746` |
