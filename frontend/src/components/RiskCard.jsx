import React from 'react';
import { TrendingUp, Info } from 'lucide-react';

export default function RiskCard({ prediction }) {
  if (!prediction) return null;

  const pct = prediction.risk_percentage || 0;
  const rawLevel = prediction.risk_level || 'Low';
  const factors = prediction.top_factors || [];

  // Determine classification using tuned model threshold (0.55)
  const isHigherRisk = rawLevel === 'High' || prediction.is_spike_predicted;
  const classificationLabel = isHigherRisk ? 'Higher Risk' : 'Lower Risk';

  const getRiskTheme = () => {
    if (isHigherRisk) {
      return {
        text: 'text-red-400',
        bgProgress: 'bg-red-500',
        badge: 'bg-red-500/10 text-red-400 border-red-500/20'
      };
    } else if (rawLevel === 'Moderate') {
      return {
        text: 'text-amber-400',
        bgProgress: 'bg-amber-500',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    } else {
      return {
        text: 'text-emerald-400',
        bgProgress: 'bg-emerald-500',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    }
  };

  const theme = getRiskTheme();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-200">2-Hour Glucose Spike Risk</h3>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${theme.badge}`}>
            {classificationLabel}
          </span>
        </div>

        {/* Probability Gauge & Wording */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>{pct}%</span>
          <span className="text-xs text-slate-400 font-medium">Model-Predicted Probability</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-slate-800 rounded-full h-3 p-0.5 border border-slate-700/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${theme.bgProgress}`}
            style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
          />
        </div>

        {/* Factors list */}
        <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Key Model Factors</span>
          </div>
          <ul className="space-y-1 text-slate-400 text-[11px]">
            {factors.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>• {f.readable_name || f.feature}</span>
                <span className={f.impact > 0 ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {f.direction}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 text-[11px] text-slate-400 flex items-center justify-between pt-3 border-t border-slate-800">
        <span>Horizon: Approximately 2 hours</span>
        <span className="text-teal-400 font-mono font-semibold">Threshold: 0.55</span>
      </div>
    </div>
  );
}
