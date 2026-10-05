import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWearableSeries, getGlucoseSeries } from '../services/api';
import TrendChart from '../components/TrendChart';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Watch, Heart, Footprints, Moon, Activity } from 'lucide-react';

export default function WearablesPage() {
  const { patientId } = useParams();
  const activeId = patientId || 'GT-001';

  const [wearable, setWearable] = useState([]);
  const [glucose, setGlucose] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [wRes, gRes] = await Promise.all([
          getWearableSeries(activeId),
          getGlucoseSeries(activeId)
        ]);
        setWearable(wRes.data.wearable_series || []);
        setGlucose(gRes.data.glucose_series || []);
      } catch (err) {
        setError(`Failed to fetch wearable telemetry for ${activeId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeId]);

  if (loading) return <LoadingState message="Fetching Wearable IoT & Continuous Glucose streams..." />;
  if (error) return <ErrorState error={error} />;

  // Take recent 48 hours for detail view
  const recentWearable = wearable.slice(-48);
  const recentGlucose = glucose.slice(-48);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <Watch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Wearable IoT & Physiological Telemetry</h1>
            <p className="text-xs text-slate-400">High-resolution continuous streams for Digital Twin fusion (Last 48 Hours)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TrendChart
          data={recentGlucose}
          dataKey="glucose_mgdl"
          title="Continuous Glucose Monitoring (CGM) Telemetry Stream"
          strokeColor="#14b8a6"
          threshold={180}
          unit="mg/dL"
        />

        <TrendChart
          data={recentWearable}
          dataKey="heart_rate"
          title="Heart Rate Pulse Dynamics (BPM)"
          strokeColor="#f43f5e"
          unit="bpm"
        />

        <TrendChart
          data={recentWearable}
          dataKey="steps"
          title="Hourly Physical Activity (Step Count)"
          strokeColor="#f59e0b"
          unit="steps"
        />
      </div>
    </div>
  );
}
