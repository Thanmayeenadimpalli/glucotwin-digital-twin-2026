# GlucoTwin — 20-Minute Competition Demo Script & Jury Walkthrough

## Timing & Agenda Overview
- **00:00 - 03:00**: Problem Statement, Healthcare Motivation & Digital Twin Vision
- **03:00 - 06:00**: Technical Architecture & Multi-Stream Data Fusion (EHR + Wearables + CGM)
- **06:00 - 10:00**: Live Application Walkthrough (Landing Page, Patient Switcher, Dashboard State)
- **10:00 - 14:00**: ML 2-Hour Glucose Spike Prediction & SHAP Feature Attributions
- **14:00 - 17:00**: Digital Twin Counterfactual Simulation Engine (Live Parameter Modification)
- **17:00 - 20:00**: Clinical Summary Reports, Validation Metrics & Jury Q&A

---

## Step-by-Step Script

### Part 1: Introduction & Landing Page (00:00 - 03:00)
- **Presenter**: *"Good morning judges. Welcome to GlucoTwin — an AI Digital Twin designed for early prediction of glucose spikes in Type 2 Diabetes."*
- **Action**: Open `http://localhost:5173/`. Point to the landing page banner and conceptual pipeline diagram.
- **Presenter**: *"Diabetes management today is mostly reactive. Continuous Glucose Monitors alert patients after a spike begins. GlucoTwin creates a continuous virtual replica of the patient that fuses static clinical history with live IoT telemetry to anticipate spikes 2 hours before they occur."*

### Part 2: Patient Demo Profile Selection (03:00 - 06:00)
- **Action**: Click **Launch Demo Dashboard** to navigate to `/login`.
- **Presenter**: *"We have established 3 distinct synthetic patient profiles:*
  1. *GT-001 (Alex Mercer): Moderate baseline metabolic risk.*
  2. *GT-002 (Brenda Vance): High baseline risk (BMI 33.8, HbA1c 7.4%).*
  3. *GT-003 (Charles Chen): Low baseline risk.*
  *Let's select GT-001 to explore the Digital Twin engine."*

### Part 3: Live Dashboard & Digital Twin State (06:00 - 10:00)
- **Action**: Navigate to `/dashboard/GT-001`.
- **Presenter**: *"Notice the top Digital Twin Status Card. It shows all 3 data streams — EHR, Wearable IoT, and CGM — actively fused. The system displays current glucose, pulse, 3-hour step count, and sleep quality."*
- **Highlight**: Point out the **2-Hour Glucose Spike Risk Gauge** showing the predicted probability and risk level (Low / Watch / Elevated).

### Part 4: Forecast & Explainability (10:00 - 14:00)
- **Action**: Navigate to `/explainability/GT-001`.
- **Presenter**: *"Black-box AI is unusable in healthcare. GlucoTwin integrates SHAP (SHapley Additive exPlanations) to break down exactly why a prediction was made. For instance, recent elevated glucose slope (+10 mg/dL/hr) and a high-carb meal input are identified as the top risk drivers."*

### Part 5: Counterfactual Simulation Engine (14:00 - 17:00)
- **Action**: Navigate to `/simulation/GT-001`.
- **Presenter**: *"This is our core innovation: The Digital Twin Counterfactual Simulator. Suppose Alex Mercer increases physical activity from 1,500 to 8,000 steps and lowers carbohydrate intake. Let's click 'Run Simulation'."*
- **Action**: Move sliders and click **Run Simulation & Update Twin**.
- **Presenter**: *"Watch the real-time risk comparison view. The predicted 2-hour spike risk drops dynamically! This allows clinicians and patients to explore non-clinical 'what-if' scenarios."*

### Part 6: Clinical Reports, Metrics & Wrap-Up (17:00 - 20:00)
- **Action**: Navigate to `/reports/GT-001` and `/about`.
- **Presenter**: *"Finally, GlucoTwin generates structured clinical summary reports complete with actual ML model validation metrics — achieving a 0.9027 ROC-AUC and 91.1% spike recall on unseen patient test sets."*
- **Presenter**: *"Thank you judges, we welcome your questions!"*
