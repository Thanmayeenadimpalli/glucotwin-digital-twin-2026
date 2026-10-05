import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDigitalTwinState } from '../services/api';
import DigitalTwinStatusCard from '../components/DigitalTwinStatusCard';
import RiskCard from '../components/RiskCard';
import VitalCard from '../components/VitalCard';
import TrendChart from '../components/TrendChart';
import DataFusionDiagram from '../components/DataFusionDiagram';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Activity, Heart, Footprints, Moon, Flame, Utensils, Clock } from 'lucide-react';

export default function DashboardPage({ patientId: propPatientId }) {
  const { patientId: urlPatientId } = useParams();
  const activeId = urlPatientId || propPatientId || 'GT-001';

  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeWindow, setTimeWindow] = useState(24); // default 24h

  const fetchState = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDigitalTwinState(activeId);
      setState(res.data);
    } catch (err) {
      console.error('Failed to load digital twin state:', err);
      setError(`Unable to retrieve Digital Twin state for patient ${activeId}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [activeId]);

  if (loading) return <LoadingState message={`Fetching Digital Twin state for ${activeId}...`} />;
  if (error) return <ErrorState error={error} onRetry={fetchState} />;
  if (!state) return null;

  const vitals = state.current_vitals || {};
  const pred = state.prediction || {};
  const history = state.recent_24h_history || {};

  // Filter history based on selected time window (6h, 12h, 24h)
  const filteredGlucose = (history.glucose || []).slice(-timeWindow);
  const filteredWearable = (history.wearable || []).slice(-timeWindow);

  return (
    <div className="space-y-6">
      
      {/* 1. Digital Twin Status Header */}
      <DigitalTwinStatusCard state={state} />

      {/* 2. Primary 2-Hour Forecast & Vital Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Forecast Card */}
        <div className="lg:col-span-1">
          <RiskCard prediction={pred} />
        </div>

        {/* Dynamic Vitals Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <VitalCard
            title="Current Glucose"
            value={vitals.glucose_mgdl}
            unit="mg/dL"
            icon={Activity}
            colorClass="text-teal-400"
            subtitle="Recent CGM Telemetry"
            statusTag={vitals.glucose_mgdl >= 180 ? "Elevated" : "In Range"}
          />
          <VitalCard
            title="Heart Rate"
            value={vitals.heart_rate}
            unit="bpm"
            icon={Heart}
            colorClass="text-rose-400"
            subtitle="Wearable Pulse Sensor"
            statusTag="Normal Rhythm"
          />
          <VitalCard
            title="Physical Activity"
            value={vitals.steps}
            unit="steps"
            icon={Footprints}
            colorClass="text-amber-400"
            subtitle="Hourly Step Count"
            statusTag={vitals.steps > 1500 ? "Active Walk" : "Sedentary"}
          />
          <VitalCard
            title="Sleep Last Night"
            value={vitals.sleep_hours_last_night}
            unit="hours"
            icon={Moon}
            colorClass="text-indigo-400"
            subtitle="Sleep Quality Index"
            statusTag={vitals.sleep_hours_last_night < 6 ? "Restricted" : "Adequate"}
          />
          <VitalCard
            title="Calories Burned"
            value={vitals.calories_burned}
            unit="kcal/hr"
            icon={Flame}
            colorClass="text-orange-400"
            subtitle="Metabolic Rate"
            statusTag="Calculated"
          />
          <VitalCard
            title="Carb Meal Intake"
            value={vitals.carbs_intake_g}
            unit="g carbs"
            icon={Utensils}
            colorClass="text-cyan-400"
            subtitle="Simulated Meal Window"
            statusTag={vitals.carbs_intake_g > 60 ? "High Carbs" : "Low Carbs"}
          />
        </div>
      </div>

      {/* 3. Multi-Stream Data Fusion Core Diagram */}
      <DataFusionDiagram />

      {/* 4. Time Window Controls & Time-Series Trend Charts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Time-Series Chart Window</span>
          </div>
          <div className="flex items-center gap-2">
            {[6, 12, 24].map((hours) => (
              <button
                key={hours}
                onClick={() => setTimeWindow(hours)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  timeWindow === hours
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {hours} Hours
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={filteredGlucose}
            dataKey="glucose_mgdl"
            title={`Continuous Glucose Monitoring (${timeWindow}h Window)`}
            strokeColor="#14b8a6"
            threshold={180}
            unit="mg/dL"
          />
          <TrendChart
            data={filteredWearable}
            dataKey="heart_rate"
            title={`Heart Rate Pulse Dynamics (${timeWindow}h Window)`}
            strokeColor="#f43f5e"
            unit="bpm"
          />
        </div>
      </div>

    </div>
  );
}
