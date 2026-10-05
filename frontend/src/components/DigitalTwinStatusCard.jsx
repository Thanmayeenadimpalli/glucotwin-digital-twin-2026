import React from 'react';
import { Cpu, CheckCircle2, ShieldAlert, Clock, RefreshCw, Zap } from 'lucide-react';

export default function DigitalTwinStatusCard({ state }) {
  if (!state) return null;

  const pred = state.prediction || {};
  const riskLevel = pred.risk_level || 'Low';
  const riskPct = pred.risk_percentage || 0;

  const getStatusBadge = () => {
    if (riskLevel === 'High') {
      return {
        bg: 'bg-red-500/10 border-red-500/30 text-red-400',
        dot: 'bg-red-500',
        text: 'Elevated Spike Risk',
        icon: ShieldAlert
      };
    } else if (riskLevel === 'Moderate') {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        dot: 'bg-amber-500',
        text: 'Watch State',
        icon: RefreshCw
      };
    } else {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        dot: 'bg-emerald-500',
        text: 'Stable State',
        icon: CheckCircle2
      };
    }
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Patient & Twin Identity */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
            <Cpu className="w-6 h-6 text-teal-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Virtual Twin Identity</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-teal-300 font-bold">{state.patient_id}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{state.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Age {state.demographics?.age} ({state.demographics?.sex}) • BMI {state.demographics?.bmi} • HbA1c {state.demographics?.hba1c}%
            </p>
          </div>
        </div>

        {/* Live Digital Twin Status Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold ${status.bg}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot} animate-ping`} />
            <StatusIcon className="w-4 h-4" />
            <span>Digital Twin State: {status.text}</span>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-slate-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>2-Hr Forecast Horizon</span>
          </div>
        </div>

      </div>

      {/* Streams Fusion Indicator */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Static EHR</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fused
          </span>
        </div>
        <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Wearable IoT</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        </div>
        <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">CGM Telemetry</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Streamed
          </span>
        </div>
        <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">ML Model</span>
          <span className="flex items-center gap-1 text-teal-400 font-mono font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> XGBoost
          </span>
        </div>
      </div>
    </div>
  );
}
