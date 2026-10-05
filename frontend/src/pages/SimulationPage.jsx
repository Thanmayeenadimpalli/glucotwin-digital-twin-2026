import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDigitalTwinState } from '../services/api';
import SimulationPanel from '../components/SimulationPanel';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Sliders, AlertCircle } from 'lucide-react';

export default function SimulationPage() {
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
        setError(`Failed to load Digital Twin state for ${activeId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchState();
  }, [activeId]);

  if (loading) return <LoadingState message="Initializing Digital Twin Simulation Environment..." />;
  if (error) return <ErrorState error={error} />;
  if (!state) return null;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Digital Twin What-If Simulation</h1>
            <p className="text-xs text-slate-400">Explore how changes to the simulated patient state affect the model prediction.</p>
          </div>
        </div>
      </div>

      {/* Mandatory Non-Clinical Advice Disclaimer */}
      <div className="p-4 bg-amber-950/50 border border-amber-800/50 rounded-2xl text-amber-200 text-xs flex items-center gap-2.5">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
        <span>
          <strong>SIMULATION ONLY:</strong> Results are not medical advice and should not be interpreted as treatment recommendations.
        </span>
      </div>

      <SimulationPanel patientId={activeId} currentState={state} />
    </div>
  );
}
