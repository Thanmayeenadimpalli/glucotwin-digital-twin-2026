# GlucoTwin — Data Dictionary & Synthetic Pipeline Specification

> **Happiest Health Digital Twin Challenge 2026**  
> *Data Pipeline Documentation & Empirical Dataset Statistics*

---

## 1. Overview & Dataset Summary
The GlucoTwin data pipeline generates 4 reproducible synthetic datasets using a fixed random seed (`seed=42`).

### Empirical Dataset Statistics
- **Total Synthetic Patients**: `50` (`GT-001` through `GT-050`)
- **Observation Period**: 14 continuous days per patient (336 hours total)
- **Sampling Frequency**: Hourly (1-hour time step resolution)
- **Static EHR Records (`synthetic_ehr.csv`)**: `50` rows
- **Wearable IoT Records (`synthetic_wearable.csv`)**: `16,800` rows
- **Glucose Telemetry Records (`synthetic_glucose.csv`)**: `16,800` rows
- **Fused Feature Rows (`feature_dataset.csv`)**: `16,400` observations
- **Target Distribution**: `2,979` positive spike instances (**18.16%** positive rate)
- **Missing Values**: `0` (0 missing values across all datasets)
- **Duplicate Records**: `0` (0 duplicate rows found)

---

## 2. Static EHR Dataset (`synthetic_ehr.csv`)

| Field Name | Description | Data Type | Unit | Static/Dynamic | Model Feature? | Available at Prediction Time? |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `patient_id` | Unique synthetic patient identifier | String | N/A | Static | No (ID) | Yes |
| `name` | Synthetic patient display name | String | N/A | Static | No | Yes |
| `age` | Patient age in years | Integer | Years | Static | Yes | Yes |
| `sex` | Sex assigned at birth | Categorical (M/F) | N/A | Static | Yes (Encoded) | Yes |
| `bmi` | Body Mass Index | Float | kg/m² | Static | Yes | Yes |
| `hba1c` | Glycated hemoglobin level | Float | % | Static | Yes | Yes |
| `fasting_glucose` | Baseline fasting plasma glucose | Float | mg/dL | Static | Yes | Yes |
| `hypertension` | Hypertension diagnosis flag | Binary (0/1) | N/A | Static | Yes | Yes |
| `family_history_diabetes` | Family history of diabetes | Binary (0/1) | N/A | Static | Yes | Yes |
| `activity_level_baseline` | Baseline daily activity category | Categorical | N/A | Static | Yes (Encoded) | Yes |
| `smoking_status` | Smoking history status | Categorical | N/A | Static | No | Yes |

---

## 3. Dynamic Wearable IoT Dataset (`synthetic_wearable.csv`)

| Field Name | Description | Data Type | Unit | Static/Dynamic | Model Feature? | Available at Prediction Time? |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `patient_id` | Unique synthetic patient identifier | String | N/A | Dynamic | No (ID) | Yes |
| `timestamp` | Logging timestamp (Hourly) | String | YYYY-MM-DD HH:MM:SS | Dynamic | No (Index) | Yes |
| `heart_rate` | Average pulse heart rate | Float | bpm | Dynamic | Yes (3h Mean) | Yes |
| `steps` | Step count in past hour | Integer | steps | Dynamic | Yes (3h/6h Sum) | Yes |
| `sleep_hours_last_night` | Total sleep hours last night | Float | hours | Dynamic | Yes | Yes |
| `activity_intensity` | Rest (0), Moderate (1), Vigorous (2) | Integer | 0-2 Scale | Dynamic | Indirect | Yes |
| `calories_burned` | Estimated hourly caloric burn | Float | kcal/hr | Dynamic | No | Yes |
| `stress_level` | Physiological stress index | Integer | 1-10 Scale | Dynamic | Yes (3h Mean) | Yes |
| `carbs_intake_g` | Carbohydrates consumed in hour | Float | grams | Dynamic | Yes (2h/4h Sum) | Yes |

---

## 4. Continuous Glucose Dataset (`synthetic_glucose.csv`)

| Field Name | Description | Data Type | Unit | Static/Dynamic | Model Feature? | Available at Prediction Time? |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `patient_id` | Unique synthetic patient identifier | String | N/A | Dynamic | No (ID) | Yes |
| `timestamp` | Logging timestamp (Hourly) | String | YYYY-MM-DD HH:MM:SS | Dynamic | No (Index) | Yes |
| `glucose_mgdl` | Sensor glucose reading | Float | mg/dL | Dynamic | Yes (`current_glucose`) | Yes |

---

## 5. Fused Temporal Feature Dataset (`feature_dataset.csv`)

| Feature Name | Derivation / Formula | Description | Model Target / Feature |
| :--- | :--- | :--- | :---: |
| `current_glucose` | $\text{Glucose}_t$ | Current glucose at time $t$ | Feature |
| `glucose_mean_3h` | $\frac{1}{3}\sum_{k=0}^2 \text{Glucose}_{t-k}$ | 3-Hour rolling average glucose | Feature |
| `glucose_std_3h` | $\text{std}(\text{Glucose}_{t-2:t})$ | 3-Hour glucose volatility | Feature |
| `glucose_slope_3h` | $(\text{Glucose}_t - \text{Glucose}_{t-2})/2$ | 3-Hour glucose trend slope | Feature |
| `carbs_sum_2h` | $\sum_{k=0}^1 \text{Carbs}_{t-k}$ | 2-Hour accumulated carbs intake | Feature |
| `carbs_sum_4h` | $\sum_{k=0}^3 \text{Carbs}_{t-k}$ | 4-Hour accumulated carbs intake | Feature |
| `steps_sum_3h` | $\sum_{k=0}^2 \text{Steps}_{t-k}$ | 3-Hour step count accumulation | Feature |
| `steps_sum_6h` | $\sum_{k=0}^5 \text{Steps}_{t-k}$ | 6-Hour step count accumulation | Feature |
| `hr_mean_3h` | $\frac{1}{3}\sum_{k=0}^2 \text{HR}_{t-k}$ | 3-Hour mean heart rate | Feature |
| `stress_mean_3h` | $\frac{1}{3}\sum_{k=0}^2 \text{Stress}_{t-k}$ | 3-Hour mean stress level | Feature |
| `sleep_hours_last_night` | $\text{Sleep}_t$ | Sleep hours logged last night | Feature |
| `age`, `bmi`, `hba1c`, ... | Static EHR attributes | Metabolic & demographic baselines | Feature |
| `future_glucose_spike_2h` | $\max(G_{t+1}, G_{t+2}) \ge 180 \lor \Delta \ge 40$ | Target variable (2-Hour Spike) | **TARGET** |

---

## 6. Mathematical Target Definition & Leakage Prevention Rule

### Target Definition Formula
At index $t$, the binary classification target $Y_t$ is defined as:
$$Y_t = \begin{cases} 
1 & \text{if } \max(\text{Glucose}_{t+1}, \text{Glucose}_{t+2}) \ge 180.0 \text{ mg/dL} \quad \text{OR} \quad \max(\text{Glucose}_{t+1}, \text{Glucose}_{t+2}) - \text{Glucose}_t \ge 40.0 \text{ mg/dL} \\
0 & \text{otherwise}
\end{cases}$$

### Strict Leakage Prevention Rule
To guarantee zero future data leakage during training and evaluation:
1. Feature vector $X_t$ uses strictly historical indices $\{t-5, t-4, t-3, t-2, t-1, t\}$.
2. Target $Y_t$ evaluates strictly future indices $\{t+1, t+2\}$.
3. Data splitting uses `GroupShuffleSplit` by `patient_id` so that no training patient records appear in the test evaluation set.
