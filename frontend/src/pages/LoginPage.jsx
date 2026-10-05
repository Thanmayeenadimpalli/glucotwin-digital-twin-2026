import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Check, ArrowRight } from 'lucide-react';

export default function LoginPage({ patients, onSelectPatient, onLogin }) {
  const navigate = useNavigate();

  const handleSelectDemoPatient = (patientId) => {
    onSelectPatient(patientId);
    onLogin();
    navigate(`/dashboard/${patientId}`);
  };

  const demoPatients = [
    {
      id: 'GT-001',
      name: 'Alex Mercer',
      title: 'Moderate Baseline Risk',
      desc: 'Age 48, BMI 27.5, HbA1c 6.1%. Baseline moderate risk profile.',
      badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
    },
    {
      id: 'GT-002',
      name: 'Brenda Vance',
      title: 'High Baseline Risk',
      desc: 'Age 56, BMI 33.8, HbA1c 7.4%. History of hypertension & sedentary lifestyle.',
      badge: 'border-red-500/30 text-red-400 bg-red-500/10'
    },
    {
      id: 'GT-003',
      name: 'Charles Chen',
      title: 'Low Baseline Risk',
      desc: 'Age 32, BMI 22.4, HbA1c 5.2%. Highly active profile with minimal risk factors.',
      badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-xs font-semibold border border-teal-500/20">
          <Shield className="w-3.5 h-3.5" /> Competition Demo Authentication Mode
        </div>
        <h1 className="text-3xl font-extrabold text-white">Select a Digital Twin Demo Patient</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Choose from pre-configured synthetic patient profiles to explore real-time digital twin state fusion, 2-hour spike forecasting, and simulation counterfactuals.
        </p>
      </div>

      {/* Demo Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demoPatients.map((p) => (
          <div
            key={p.id}
            onClick={() => handleSelectDemoPatient(p.id)}
            className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-6 shadow-xl cursor-pointer transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-teal-400 font-bold">{p.id}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${p.badge}`}>
                  {p.title}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
            </div>

            <button className="mt-6 w-full py-2.5 bg-slate-800 group-hover:bg-teal-600 text-slate-200 group-hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
              Select Patient Twin <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
