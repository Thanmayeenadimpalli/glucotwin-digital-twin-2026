import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { simulateDigitalTwin } from '../services/api';

export default function SimulationPanel({ patientId, currentState, onSimulationResult }) {
  const defaultVitals = currentState?.current_vitals || {};

  const [steps, setSteps] = useState(defaultVitals.steps || 1500);
  const [sleepHours, setSleepHours] = useState(defaultVitals.sleep_hours_last_night || 7.0);
  const [carbs, setCarbs] = useState(defaultVitals.carbs_intake_g || 45.0);
  const [stress, setStress] = useState(defaultVitals.stress_level || 3);
  const [currentGlucose, setCurrentGlucose] = useState(defaultVitals.glucose_mgdl || 110.0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await simulateDigitalTwin(patientId, {
        steps,
        sleep_hours_last_night: sleepHours,
        carbs_intake_g: carbs,
        stress_level: stress,
        current_glucose: currentGlucose
      });
      setResult(res.data);
      if (onSimulationResult) {
        onSimulationResult(res.data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSteps(defaultVitals.steps || 1500);
    setSleepHours(defaultVitals.sleep_hours_last_night || 7.0);
    setCarbs(defaultVitals.carbs_intake_g || 45.0);
    setStress(defaultVitals.stress_level || 3);
    setCurrentGlucose(defaultVitals.glucose_mgdl || 110.0);
    setResult(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Digital Twin Parameter Simulation</h3>
            <p className="text-xs text-slate-400">Modify physiological inputs & recalculate predicted 2-hr risk</p>
          </div>
        </div>
        
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset to Baseline
        </button>
      </div>

      {/* Warning Disclaimer Badge */}
      <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-300 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
        <span><strong>SIMULATION ONLY:</strong> Not medical advice. Does not guarantee actual clinical outcomes.</span>
      </div>

      {/* Sliders Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Carbohydrate Intake Slider */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">Carbohydrate Meal Input</span>
            <span className="font-mono text-teal-400 font-bold">{carbs} grams</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={carbs}
            onChange={(e) => setCarbs(parseFloat(e.target.value))}
            className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Fast Fasting (0g)</span>
            <span>Moderate (50g)</span>
            <span>Heavy Meal (120g+)</span>
          </div>
        </div>

        {/* Physical Activity Steps Slider */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">Recent Physical Activity (3h Steps)</span>
            <span className="font-mono text-teal-400 font-bold">{steps} steps</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="500"
            value={steps}
            onChange={(e) => setSteps(parseFloat(e.target.value))}
            className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Sedentary (0)</span>
            <span>Brisk Walk (4,000)</span>
            <span>Active Workout (8,000+)</span>
          </div>
        </div>

        {/* Sleep Hours Slider */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">Sleep Duration Last Night</span>
            <span className="font-mono text-teal-400 font-bold">{sleepHours} hrs</span>
          </div>
          <input
            type="range"
            min="3.0"
            max="10.0"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(parseFloat(e.target.value))}
            className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Deprived (4h)</span>
            <span>Normal (7.5h)</span>
            <span>Restful (9h)</span>
          </div>
        </div>

        {/* Stress Level Slider */}
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300">Stress Indicator Level</span>
            <span className="font-mono text-teal-400 font-bold">Level {stress} / 10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={stress}
            onChange={(e) => setStress(parseInt(e.target.value))}
            className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Relaxed (1)</span>
            <span>Moderate (5)</span>
            <span>Severe Stress (10)</span>
          </div>
        </div>

      </div>

      {/* Recalculate Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
          {loading ? 'Recalculating Twin State...' : 'Run Simulation & Update Twin'}
        </button>
      </div>

      {/* Simulation Result Comparison View */}
      {result && (
        <div className="mt-6 p-5 bg-slate-950 rounded-2xl border border-teal-500/30">
          <div className="flex items-center gap-2 text-teal-400 text-sm font-bold mb-4">
            <ShieldCheck className="w-5 h-5" />
            <span>Simulation Result Comparison</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Baseline Risk</span>
              <div className="text-2xl font-bold text-white mt-1">{result.baseline.risk_percentage}%</div>
              <span className="text-[10px] text-slate-400">{result.baseline.risk_level} Risk</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-center items-center">
              <span className="text-xs text-slate-400">Risk Delta</span>
              <div className={`text-2xl font-bold mt-1 ${result.comparison.risk_percentage_change <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.comparison.risk_percentage_change > 0 ? `+${result.comparison.risk_percentage_change}%` : `${result.comparison.risk_percentage_change}%`}
              </div>
              <span className="text-[10px] font-semibold text-teal-400 mt-0.5">{result.comparison.direction}</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Simulated Risk</span>
              <div className="text-2xl font-bold text-teal-300 mt-1">{result.simulated.risk_percentage}%</div>
              <span className="text-[10px] text-slate-400">{result.simulated.risk_level} Risk</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
