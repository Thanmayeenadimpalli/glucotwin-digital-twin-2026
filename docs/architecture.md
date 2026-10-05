# GlucoTwin — Complete System Architecture & Pipeline Specification

> **Happiest Health Digital Twin Challenge 2026**  
> *End-to-End Modular Full-Stack Software & ML Architecture*

---

## 1. High-Level Component Flow

```mermaid
flowchart TD
    subgraph Client Layer
        React[React 19 Frontend Dashboard\n`frontend/src/App.jsx`]
        Router[React Router & Navigation]
        Recharts[Recharts Telemetry Visualizers]
    end

    subgraph API & Backend Core
        Flask[Flask REST API Server\n`backend/app.py`]
        CORS[Flask-CORS Middleware]
        Routes[API Routes Blueprint\n`backend/routes/api.py`]
    end

    subgraph Digital Twin Engine
        Twin[DigitalTwin Class\n`backend/digital_twin/twin_engine.py`]
        Filter[Time-Aware Temporal Filter\n`timestamp <= T`]
        State[Virtual Patient State Representation]
    end

    subgraph Machine Learning Pipeline
        Scaler[StandardScaler Preprocessing\n`models/scaler.joblib`]
        XGB[XGBoost Spike Classifier\n`models/glucose_spike_model.joblib`]
        SHAP[SHAP Feature Attribution Explainer\n`ml/inference/predict.py`]
    end

    React --> Router
    Router --> Recharts
    React <-->|Axios REST Calls| Flask
    Flask --> Routes
    Routes --> Twin
    Twin --> Filter
    Filter --> State
    State --> Scaler
    Scaler --> XGB
    XGB --> SHAP
    SHAP --> Routes
```

---

## 2. Multi-Stream Data Fusion Architecture

```mermaid
flowchart LR
    EHR[Static EHR Database\n`synthetic_ehr.csv`] --> Fusion[Multi-Stream Fusion Core]
    Wearable[Wearable IoT Stream\n`synthetic_wearable.csv`] --> Fusion
    CGM[CGM Glucose Stream\n`synthetic_glucose.csv`] --> Fusion

    Fusion --> TwinState[Digital Twin State]
    TwinState --> Prediction[2-Hour Risk Prediction]
    Prediction --> Explainability[SHAP Attributions]
    Explainability --> Simulation[What-If Counterfactual Simulator]
```

---

## 3. Module Breakdown

### Frontend (`frontend/`)
- Built with **React 19**, **Vite**, **Tailwind CSS**, **Recharts**, and **Lucide React**.
- Proxy configured in `vite.config.js` to route `/api/*` calls directly to `http://127.0.0.1:5000`.

### Backend API (`backend/`)
- **Flask REST API** handling JSON requests for patient profiles, digital twin states, telemetry series, simulations, prediction history, explainability, and metrics.

### Digital Twin Engine (`backend/digital_twin/`)
- Fuses static EHR records with time-series telemetry.
- Enforces strict temporal filtering ($\text{timestamp} \le T$) to prevent future data leakage.

### Machine Learning (`ml/` & `models/`)
- **XGBoost Classifier** (`models/glucose_spike_model.joblib`) trained on 40 patients and validated on 10 unseen test patients.
- **SHAP Explainer** providing instance-level feature attributions.
