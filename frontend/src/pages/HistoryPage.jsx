import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPredictionHistory } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { History, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function HistoryPage() {
  const { patientId } = useParams();
  const activeId = patientId || 'GT-001';

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getPredictionHistory(activeId);
        setHistory(res.data.history || []);
      } catch (err) {
        setError(`Failed to fetch prediction history for ${activeId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [activeId]);

  if (loading) return <LoadingState message="Retrieving prediction audit logs..." />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Prediction Audit Log & Outcome History</h1>
            <p className="text-xs text-slate-400">Comparing historical 2-hour forecasts with ground truth synthetic observations</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="py-3 px-3">Timestamp (t)</th>
              <th className="py-3 px-3">Glucose at t</th>
              <th className="py-3 px-3">2h Carb Intake</th>
              <th className="py-3 px-3">3h Steps</th>
              <th className="py-3 px-3">Ground Truth Outcome (+2h Spike)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {history.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-mono text-slate-400">{row.timestamp}</td>
                <td className="py-3 px-3 font-bold text-white">{row.current_glucose} mg/dL</td>
                <td className="py-3 px-3">{row.carbs_2h} g</td>
                <td className="py-3 px-3">{row.steps_3h} steps</td>
                <td className="py-3 px-3">
                  {row.actual_outcome_2h_spike === 1 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Spike Observed (&ge;180 or +40)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Normal Range
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
