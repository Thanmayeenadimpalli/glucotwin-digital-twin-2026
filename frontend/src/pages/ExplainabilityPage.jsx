import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getExplainability } from '../services/api';
import FeatureImportance from '../components/FeatureImportance';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { BrainCircuit, Info, Sparkles } from 'lucide-react';

export default function ExplainabilityPage() {
  const { patientId } = useParams();
  const activeId = patientId || 'GT-001';

  const [explainData, setExplainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExplain = async () => {
      setLoading(true);
      try {
        const res = await getExplainability(activeId);
        setExplainData(res.data);
      } catch (err) {
        setError(`Failed to fetch explainability breakdown for ${activeId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchExplain();
  }, [activeId]);

  if (loading) return <LoadingState message="Computing SHAP feature attributions..." />;
  if (error) return <ErrorState error={error} />;
  if (!explainData) return null;

  const topFactors = explainData.top_contributing_factors || [];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Why did the model make this prediction?</h1>
            <p className="text-xs text-slate-400">Additive SHAP feature contribution breakdown for target patient state</p>
          </div>
        </div>
      </div>

      {/* Human-Readable Explanation Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Model Attribution Summary</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
          {explainData.human_readable_summary}
        </p>
        <p className="text-[11px] text-amber-300/80 italic">
          Note: Feature attributions indicate mathematical factors associated with higher or lower model-predicted risk. They do not represent direct clinical causality or diagnostic medical advice.
        </p>
      </div>

      {/* SHAP Bar Chart */}
      <FeatureImportance factors={topFactors} title="SHAP Feature Attributions for Current Prediction" />

      {/* Detailed Table of Factors */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Detailed Feature Attribution Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Feature Name</th>
                <th className="py-2.5 px-3">Observed Value</th>
                <th className="py-2.5 px-3">SHAP Attribution Impact</th>
                <th className="py-2.5 px-3">Model Association</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {topFactors.map((f, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-white">{f.readable_name}</td>
                  <td className="py-3 px-3 font-mono">{typeof f.value === 'number' ? f.value.toFixed(1) : f.value}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-teal-400">
                    {f.impact > 0 ? `+${f.impact}` : f.impact}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      f.impact > 0 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {f.impact > 0 ? 'Associated with higher model-predicted risk' : 'Associated with lower model-predicted risk'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
