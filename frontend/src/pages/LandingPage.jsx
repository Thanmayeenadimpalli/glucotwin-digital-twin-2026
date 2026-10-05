import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Cpu, ShieldCheck, Zap, Heart, ArrowRight, CheckCircle, Database } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" /> Happiest Health Digital Twin Challenge 2026
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          GlucoTwin: AI Digital Twin for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Early Glucose Spike Prediction</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
          Continuously fusing static Electronic Health Records (EHR) with dynamic wearable IoT telemetry to anticipate 2-hour glucose spikes in Type 2 Diabetes management.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/25 transition flex items-center justify-center gap-2 text-sm"
          >
            Launch Interactive Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl border border-slate-700 transition text-sm text-center"
          >
            Read Methodology & Architecture
          </Link>
        </div>
      </section>

      {/* Conceptual Pipeline Visualization */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-xs uppercase tracking-widest text-teal-400 font-bold text-center mb-6">Core Digital Twin Pipeline</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <Database className="w-6 h-6 text-teal-400 mx-auto" />
            <h3 className="font-bold text-white">1. Data Streams</h3>
            <p className="text-slate-400 text-[11px]">Static EHR + Wearable IoT & CGM Telemetry</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <Cpu className="w-6 h-6 text-teal-400 mx-auto" />
            <h3 className="font-bold text-white">2. State Fusion</h3>
            <p className="text-slate-400 text-[11px]">Continuous Virtual Patient Representation</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <Zap className="w-6 h-6 text-teal-400 mx-auto" />
            <h3 className="font-bold text-white">3. Feature Eng</h3>
            <p className="text-slate-400 text-[11px]">Temporal Glucose Trend & Metabolic Dynamics</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <Activity className="w-6 h-6 text-teal-400 mx-auto" />
            <h3 className="font-bold text-white">4. ML Spike Forecast</h3>
            <p className="text-slate-400 text-[11px]">2-Hour Ahead Glucose Spike Classification</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <ShieldCheck className="w-6 h-6 text-teal-400 mx-auto" />
            <h3 className="font-bold text-white">5. Explainability</h3>
            <p className="text-slate-400 text-[11px]">SHAP Attributions & Simulation Counterfactuals</p>
          </div>
        </div>
      </section>

      {/* Key Innovation Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <Cpu className="w-8 h-8 text-teal-400" />
          <h3 className="font-bold text-white text-base">Multi-Stream Patient State Fusion</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Fuses static metabolic baselines (HbA1c, Fasting Glucose, BMI) with real-time wearable streams (Heart Rate, Steps, Sleep, Stress) into a unified Digital Twin.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <Activity className="w-8 h-8 text-teal-400" />
          <h3 className="font-bold text-white text-base">2-Hour Predictive Spike Horizon</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            XGBoost ML classifier trained on temporal windows to predict whether glucose will exceed 180 mg/dL or jump &ge;40 mg/dL within 2 hours.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <ShieldCheck className="w-8 h-8 text-teal-400" />
          <h3 className="font-bold text-white text-base">Interactive Simulation & SHAP</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Allows users and clinicians to simulate lifestyle counterfactuals (e.g. step count, carbs intake, sleep) and observe real-time risk changes with SHAP explainability.
          </p>
        </div>
      </section>

    </div>
  );
}
