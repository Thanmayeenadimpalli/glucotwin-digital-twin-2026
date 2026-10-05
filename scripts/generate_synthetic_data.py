import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Output directories
os.makedirs("data", exist_ok=True)
os.makedirs("ml/data_generation", exist_ok=True)

def generate_data(random_seed=42):
    """
    Generates reproducible synthetic EHR data, wearable IoT time-series data,
    continuous glucose data, and fused temporal feature dataset.
    
    Target Definition (future_glucose_spike_2h):
    At index t, target = 1 if max(glucose_{t+1}, glucose_{t+2}) >= 180.0 mg/dL
    OR max(glucose_{t+1}, glucose_{t+2}) - glucose_t >= 40.0 mg/dL, else 0.
    
    Temporal Leakage Prevention:
    Features at index t are computed using strictly historical observations up to index t.
    """
    np.random.seed(random_seed)
    
    num_patients = 50
    days = 14
    hours_per_day = 24

    print(f"Generating synthetic data for {num_patients} patients over {days} days ({days * hours_per_day} hours/patient)...")

    # 1. Synthetic Static EHR Data
    ehr_list = []
    
    # Competition Demo Patient Profiles
    demo_profiles = [
        {
            "patient_id": "GT-001",
            "name": "Alex Mercer (Demo - Moderate Baseline Risk)",
            "age": 48,
            "sex": "M",
            "bmi": 27.5,
            "hba1c": 6.1,
            "fasting_glucose": 112.0,
            "hypertension": 1,
            "family_history_diabetes": 1,
            "activity_level_baseline": "Moderate",
            "smoking_status": "Former"
        },
        {
            "patient_id": "GT-002",
            "name": "Brenda Vance (Demo - High Baseline Risk)",
            "age": 56,
            "sex": "F",
            "bmi": 33.8,
            "hba1c": 7.4,
            "fasting_glucose": 148.0,
            "hypertension": 1,
            "family_history_diabetes": 1,
            "activity_level_baseline": "Sedentary",
            "smoking_status": "Current"
        },
        {
            "patient_id": "GT-003",
            "name": "Charles Chen (Demo - Low Baseline Risk)",
            "age": 32,
            "sex": "M",
            "bmi": 22.4,
            "hba1c": 5.2,
            "fasting_glucose": 88.0,
            "hypertension": 0,
            "family_history_diabetes": 0,
            "activity_level_baseline": "Active",
            "smoking_status": "Never"
        }
    ]

    for p in demo_profiles:
        ehr_list.append(p)

    for i in range(4, num_patients + 1):
        pid = f"GT-{i:03d}"
        age = int(np.random.randint(25, 75))
        sex = str(np.random.choice(["M", "F"]))
        bmi = round(float(np.random.normal(27.5, 4.5)), 1)
        bmi = max(18.5, min(42.0, bmi))
        
        risk_base = (bmi - 22.0) * 0.1 + (age - 30) * 0.03
        hba1c = round(float(np.random.normal(5.4 + risk_base * 0.3, 0.6)), 1)
        hba1c = max(4.8, min(10.5, hba1c))
        
        fasting_glucose = round(float(85.0 + (hba1c - 5.0) * 22.0 + np.random.normal(0, 5)), 1)
        hypertension = 1 if (bmi > 29 or age > 55 or np.random.rand() < 0.25) else 0
        family_history = 1 if np.random.rand() < 0.35 else 0
        activity_level = str(np.random.choice(["Sedentary", "Moderate", "Active"], p=[0.4, 0.4, 0.2]))
        smoking = str(np.random.choice(["Never", "Former", "Current"], p=[0.6, 0.25, 0.15]))

        ehr_list.append({
            "patient_id": pid,
            "name": f"Synthetic Patient {pid}",
            "age": age,
            "sex": sex,
            "bmi": bmi,
            "hba1c": hba1c,
            "fasting_glucose": fasting_glucose,
            "hypertension": hypertension,
            "family_history_diabetes": family_history,
            "activity_level_baseline": activity_level,
            "smoking_status": smoking
        })

    df_ehr = pd.DataFrame(ehr_list)
    df_ehr.to_csv("data/synthetic_ehr.csv", index=False)
    print(f"-> Generated static EHR dataset: {len(df_ehr)} patients.")

    # 2. Dynamic Wearable & Glucose Data Generation
    start_time = datetime(2026, 9, 1, 0, 0, 0)
    wearable_records = []
    glucose_records = []

    for idx, ehr in df_ehr.iterrows():
        pid = ehr["patient_id"]
        bmi = ehr["bmi"]
        hba1c = ehr["hba1c"]
        base_fg = ehr["fasting_glucose"]
        act_baseline = ehr["activity_level_baseline"]

        # Insulin sensitivity factor (lower sensitivity = higher glucose response)
        insulin_sensitivity = max(0.3, 1.2 - (bmi - 22.0) * 0.02 - (hba1c - 5.0) * 0.1)

        curr_glucose = base_fg

        for d in range(days):
            sleep_hours = round(max(4.0, min(9.5, np.random.normal(7.0, 1.1))), 1)
            sleep_deprivation_factor = max(0.0, (7.0 - sleep_hours) * 4.0)

            for h in range(hours_per_day):
                timestamp = start_time + timedelta(days=d, hours=h)
                hour = timestamp.hour

                # Meal simulation (Breakfast 8h, Lunch 13h, Dinner 19h, Snack 21h)
                carbs = 0.0
                if hour == 8:
                    carbs = float(np.random.choice([30, 50, 75, 90], p=[0.3, 0.4, 0.2, 0.1]))
                elif hour == 13:
                    carbs = float(np.random.choice([40, 60, 85, 110], p=[0.2, 0.4, 0.3, 0.1]))
                elif hour == 19:
                    carbs = float(np.random.choice([35, 65, 95, 120], p=[0.2, 0.4, 0.3, 0.1]))
                elif hour == 21 and np.random.rand() < 0.3:
                    carbs = float(np.random.choice([20, 35, 50], p=[0.5, 0.3, 0.2]))

                # Steps & Activity
                if 0 <= hour <= 6: # Sleeping window
                    steps = int(np.random.poisson(10))
                    hr = float(np.random.normal(58, 4))
                    intensity = 0
                    calories = round(float(np.random.normal(60, 5)), 1)
                    stress = int(np.random.choice([1, 2], p=[0.8, 0.2]))
                else:
                    if act_baseline == "Active":
                        step_mean = 900
                    elif act_baseline == "Moderate":
                        step_mean = 550
                    else:
                        step_mean = 250

                    if np.random.rand() < 0.15: # Active exercise session
                        steps = int(np.random.normal(2500, 400))
                        intensity = 2
                        hr = float(np.random.normal(125, 12))
                        calories = round(float(np.random.normal(280, 40)), 1)
                        stress = int(np.random.choice([2, 3, 4], p=[0.4, 0.4, 0.2]))
                    else:
                        steps = int(np.random.poisson(step_mean))
                        intensity = 1 if steps > 400 else 0
                        hr = float(np.random.normal(72 + (steps / 200), 6))
                        calories = round(float(75 + steps * 0.04), 1)
                        stress = int(np.random.choice([2, 3, 4, 5, 6], p=[0.2, 0.3, 0.3, 0.1, 0.1]))

                steps = max(0, steps)
                hr = max(45.0, min(175.0, hr))

                # Physiological dynamics update
                carb_spike = (carbs / insulin_sensitivity) * 0.85
                activity_drop = (steps / 1000.0) * 8.0 * insulin_sensitivity
                stress_sleep_bump = (stress * 1.2) + sleep_deprivation_factor * 0.5
                reversion = (base_fg - curr_glucose) * 0.25
                noise = np.random.normal(0, 3.5)

                curr_glucose = curr_glucose + carb_spike - activity_drop + stress_sleep_bump + reversion + noise
                curr_glucose = max(65.0, min(320.0, curr_glucose))

                ts_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")

                wearable_records.append({
                    "patient_id": pid,
                    "timestamp": ts_str,
                    "heart_rate": round(hr, 1),
                    "steps": steps,
                    "sleep_hours_last_night": sleep_hours,
                    "activity_intensity": intensity,
                    "calories_burned": calories,
                    "stress_level": stress,
                    "carbs_intake_g": carbs
                })

                glucose_records.append({
                    "patient_id": pid,
                    "timestamp": ts_str,
                    "glucose_mgdl": round(curr_glucose, 1)
                })

    df_wearable = pd.DataFrame(wearable_records)
    df_glucose = pd.DataFrame(glucose_records)

    df_wearable.to_csv("data/synthetic_wearable.csv", index=False)
    df_glucose.to_csv("data/synthetic_glucose.csv", index=False)
    print(f"-> Generated wearable dataset: {len(df_wearable)} records.")
    print(f"-> Generated glucose dataset: {len(df_glucose)} records.")

    # 3. Construct Feature Dataset with Strict Temporal Scoping & Target Definition
    print("-> Constructing temporal feature dataset...")
    df_ts = pd.merge(df_wearable, df_glucose, on=["patient_id", "timestamp"])
    df_ts["timestamp"] = pd.to_datetime(df_ts["timestamp"])
    df_ts = df_ts.sort_values(["patient_id", "timestamp"]).reset_index(drop=True)

    feature_rows = []

    for pid, group in df_ts.groupby("patient_id"):
        group = group.reset_index(drop=True)
        ehr_row = df_ehr[df_ehr["patient_id"] == pid].iloc[0]

        g_vals = group["glucose_mgdl"].values
        hr_vals = group["heart_rate"].values
        step_vals = group["steps"].values
        carb_vals = group["carbs_intake_g"].values
        stress_vals = group["stress_level"].values
        sleep_vals = group["sleep_hours_last_night"].values
        ts_vals = group["timestamp"].values

        n = len(group)

        for t in range(6, n - 2):
            future_max = max(g_vals[t+1], g_vals[t+2])
            spike_target = 1 if (future_max >= 180.0 or (future_max - g_vals[t]) >= 40.0) else 0

            curr_g = g_vals[t]
            g_3h_mean = float(np.mean(g_vals[t-2:t+1]))
            g_3h_std = float(np.std(g_vals[t-2:t+1]))
            g_slope_3h = float((g_vals[t] - g_vals[t-2]) / 2.0)
            
            carbs_2h_sum = float(np.sum(carb_vals[t-1:t+1]))
            carbs_4h_sum = float(np.sum(carb_vals[t-3:t+1]))
            
            steps_3h_sum = float(np.sum(step_vals[t-2:t+1]))
            steps_6h_sum = float(np.sum(step_vals[t-5:t+1]))
            
            hr_3h_mean = float(np.mean(hr_vals[t-2:t+1]))
            stress_3h_mean = float(np.mean(stress_vals[t-2:t+1]))
            sleep_last_night = float(sleep_vals[t])

            feature_rows.append({
                "patient_id": pid,
                "timestamp": str(ts_vals[t]),
                "current_glucose": curr_g,
                "glucose_mean_3h": g_3h_mean,
                "glucose_std_3h": g_3h_std,
                "glucose_slope_3h": g_slope_3h,
                "carbs_sum_2h": carbs_2h_sum,
                "carbs_sum_4h": carbs_4h_sum,
                "steps_sum_3h": steps_3h_sum,
                "steps_sum_6h": steps_6h_sum,
                "hr_mean_3h": hr_3h_mean,
                "stress_mean_3h": stress_3h_mean,
                "sleep_hours_last_night": sleep_last_night,
                "age": ehr_row["age"],
                "sex": 1 if ehr_row["sex"] == "M" else 0,
                "bmi": ehr_row["bmi"],
                "hba1c": ehr_row["hba1c"],
                "fasting_glucose": ehr_row["fasting_glucose"],
                "hypertension": ehr_row["hypertension"],
                "family_history_diabetes": ehr_row["family_history_diabetes"],
                "activity_level_baseline": 2 if ehr_row["activity_level_baseline"] == "Active" else (1 if ehr_row["activity_level_baseline"] == "Moderate" else 0),
                "future_glucose_spike_2h": spike_target
            })

    df_features = pd.DataFrame(feature_rows)
    df_features.to_csv("data/feature_dataset.csv", index=False)
    print(f"-> Generated feature dataset: {len(df_features)} observations.")

    # 4. Rigorous Data Validation & Sanity Audits
    validate_datasets(df_ehr, df_wearable, df_glucose, df_features)
    
    return {
        "num_patients": len(df_ehr),
        "num_ehr": len(df_ehr),
        "num_wearable": len(df_wearable),
        "num_glucose": len(df_glucose),
        "num_features": len(df_features),
        "target_positive_pct": round(float(df_features["future_glucose_spike_2h"].mean() * 100), 2)
    }

def validate_datasets(df_ehr, df_wearable, df_glucose, df_features):
    """
    Performs data integrity, missing values, duplicates, and link checks.
    """
    print("\n=== DATA PIPELINE VALIDATION SANITY CHECKS ===")
    
    # Null Value Checks
    assert df_ehr.isnull().sum().sum() == 0, "Null values found in EHR dataset!"
    assert df_wearable.isnull().sum().sum() == 0, "Null values found in Wearable dataset!"
    assert df_glucose.isnull().sum().sum() == 0, "Null values found in Glucose dataset!"
    assert df_features.isnull().sum().sum() == 0, "Null values found in Feature dataset!"
    print("[OK] Null Values Check: PASS (0 missing values across all datasets)")

    # Duplicate Record Checks
    assert df_ehr.duplicated(subset=["patient_id"]).sum() == 0, "Duplicate patient IDs in EHR!"
    assert df_wearable.duplicated(subset=["patient_id", "timestamp"]).sum() == 0, "Duplicate timestamps in Wearables!"
    assert df_glucose.duplicated(subset=["patient_id", "timestamp"]).sum() == 0, "Duplicate timestamps in Glucose!"
    print("[OK] Duplicate Check: PASS (0 duplicate records found)")

    # Patient ID Linking Consistency
    ehr_pids = set(df_ehr["patient_id"])
    w_pids = set(df_wearable["patient_id"])
    g_pids = set(df_glucose["patient_id"])
    f_pids = set(df_features["patient_id"])
    assert ehr_pids == w_pids == g_pids == f_pids, "Patient ID mismatch across datasets!"
    print(f"[OK] Patient ID Consistency Check: PASS ({len(ehr_pids)} matched patients)")

    # Target Distribution Check
    pos_rate = df_features["future_glucose_spike_2h"].mean()
    assert 0.05 < pos_rate < 0.50, f"Target rate {pos_rate} out of realistic bounds!"
    print(f"[OK] Target Distribution Check: PASS ({pos_rate*100:.2f}% positive spike rate)")

if __name__ == "__main__":
    generate_data(random_seed=42)
