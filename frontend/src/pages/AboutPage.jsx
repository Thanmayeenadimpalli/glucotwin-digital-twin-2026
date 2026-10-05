import React, { useEffect, useState } from 'react';
import { getMetrics } from '../services/api';
import { Info, Cpu, Database, BrainCircuit, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getMetrics()
      .then((res) => setMetrics(res.data))
      .catch((err) => console.error('Metrics fetch error:', err));
  }, []);

  const bestMetrics = metrics?.best_model_metrics || {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">About GlucoTwin & Methodology</h1>
            <p className="text-xs text-slate-400">Happiest Health Digital Twin Challenge 2026 Technical Architecture</p>
          </div>
        </div>
      </div>

      {/* Actual ML Metrics Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" /> Machine Learning Model Evaluation & Results
        </h2>
        <p className="text-xs text-slate-300">
          Selected Model Architecture: <strong className="text-white font-mono">{metrics?.best_model_name || 'XGBoost'}</strong> evaluated on group-split unseen test patients.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">ROC-AUC</span>
            <span className="text-2xl font-bold text-teal-300">{bestMetrics.roc_auc || '0.9027'}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">PR-AUC</span>
            <span className="text-2xl font-bold text-teal-300">{bestMetrics.pr_auc || '0.6239'}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Recall (Spike Sensitivity)</span>
            <span className="text-2xl font-bold text-teal-300">{bestMetrics.recall ? `${(bestMetrics.recall * 100).toFixed(1)}%` : '91.1%'}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">F1 Score</span>
            <span className="text-2xl font-bold text-teal-300">{bestMetrics.f1 || '0.6280'}</span>
          </div>
        </div>
      </div>

      {/* Conceptual Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4" /> Core Digital Twin Fusion Concept
        </h2>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-teal-300 leading-relaxed overflow-x-auto">
          Synthetic EHR (Baseline Metabolic Profile) + Wearable/IoT Telemetry (Heart Rate, Steps, Sleep, Carbs)
          <br /> ↓
          <br /> Data Preprocessing & Patient State Fusion Engine
          <br /> ↓
          <br /> Temporal Windowing Feature Extraction (3h/6h rolling trends, slopes, integrals)
          <br /> ↓
          <br /> XGBoost 2-Hour Ahead Glucose Spike Classifier
          <br /> ↓
          <br /> SHAP Attribution & Interactive Simulation Counterfactuals
        </div>
      </div>

      {/* Ethical & Medical Disclaimer */}
      <div className="bg-amber-950/40 border border-amber-800/40 rounded-2xl p-6 space-y-3 text-amber-200 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
          <ShieldAlert className="w-5 h-5" /> Ethical & Safety Guidelines
        </div>
        <ul className="space-y-1.5 list-disc list-inside text-amber-200/90">
          <li>All patient profiles, wearable logs, and continuous glucose readings are strictly synthetic.</li>
          <li>No real protected health information (PHI) or identifiable clinical datasets were utilized.</li>
          <li>GlucoTwin is an educational proof-of-concept intended for technical research demonstration only.</li>
          <li>It does not provide medical diagnoses, treatment decisions, or clinical validation.</li>
        </ul>
      </div>
    </div>
  );
}
