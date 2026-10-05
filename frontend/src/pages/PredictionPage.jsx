import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDigitalTwinState } from '../services/api';
import RiskCard from '../components/RiskCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function PredictionPage() {
  const { patientId } = useParams();
  const activeId = patientId || 'GT-001';

  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchState = async () => {
      setLoading(true);
      try {
        const res = await getDigitalTwinState(activeId);
        setState(res.data);
      } catch (err) {
        setError(`Failed to fetch prediction state for ${activeId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchState();
  }, [activeId]);

  if (loading) return <LoadingState message="Calculating 2-Hour Glucose Spike Prediction..." />;
  if (error) return <ErrorState error={error} />;
  if (!state) return null;

  const pred = state.prediction || {};
  const vitals = state.current_vitals || {};

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">2-Hour Glucose Spike Forecast</h1>
            <p className="text-xs text-slate-400">Targeted prediction horizon using temporal ML windowing</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskCard prediction={pred} />

        {/* Prediction Timeline & Horizon Context */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Temporal Forecast Timeline</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Current Time (t)</span>
                <span className="font-bold text-white text-sm">{vitals.glucose_mgdl} mg/dL</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">Now</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">1-Hour Window (t+1)</span>
                <span className="font-semibold text-slate-200">Metabolic Peak Window</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">+1 Hr</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Target Horizon (t+2)</span>
                <span className={`font-bold text-sm ${pred.risk_level === 'High' ? 'text-red-400' : 'text-teal-300'}`}>
                  Spike Risk: {pred.risk_percentage}% ({pred.risk_level})
                </span>
              </div>
              <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded font-mono">+2 Hr Target</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
