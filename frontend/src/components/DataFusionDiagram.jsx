import React from 'react';
import { Database, Watch, Activity, Cpu, ShieldCheck, ArrowDown } from 'lucide-react';

export default function DataFusionDiagram() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Stream Data Fusion Core</h3>
          <p className="text-xs text-slate-400">Continuous integration of static clinical EHR and dynamic IoT telemetry</p>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20">
          Stateful Pipeline
        </span>
      </div>

      {/* Visual Fusion Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stream 1: Static EHR */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400">Static EHR Stream</span>
            <Database className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-[11px] text-slate-300">Demographics, BMI, HbA1c, Fasting Glucose, History</p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Update: On Admission</span>
            <span className="text-emerald-400 font-semibold">✓ Active</span>
          </div>
        </div>

        {/* Stream 2: Wearable IoT */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">Wearable IoT Stream</span>
            <Watch className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-[11px] text-slate-300">Heart Rate, Step Count, Sleep Hours, Stress Index</p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Sampling: Hourly</span>
            <span className="text-emerald-400 font-semibold">✓ Synced</span>
          </div>
        </div>

        {/* Stream 3: CGM Telemetry */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400">CGM Glucose Stream</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-[11px] text-slate-300">Continuous Sensor Glucose Measurements (mg/dL)</p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Sampling: Hourly</span>
            <span className="text-emerald-400 font-semibold">✓ Streamed</span>
          </div>
        </div>
      </div>

      {/* Downward Fusion Arrow */}
      <div className="flex justify-center -my-2">
        <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      {/* Fused State & ML Inference Node */}
      <div className="bg-slate-950 p-5 rounded-xl border border-teal-500/30 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
            <Cpu className="w-4 h-4" />
            <span>Digital Twin State & Predictive Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Constructs 3-hour & 6-hour sliding temporal feature windows and feeds XGBoost to compute 2-hour spike risk with SHAP explainability.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Tuned Decision Threshold</span>
            <span className="font-mono text-teal-300 font-bold text-sm">0.55</span>
          </div>
          <div className="text-right pl-3 border-l border-slate-800">
            <span className="text-slate-400 block text-[10px]">Prediction Horizon</span>
            <span className="font-semibold text-white">~2 Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
