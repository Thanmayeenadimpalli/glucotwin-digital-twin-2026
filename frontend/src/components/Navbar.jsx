import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, ChevronDown, Cpu, LogOut } from 'lucide-react';

export default function Navbar({ activePatient, patients, onSelectPatient, isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-md group-hover:shadow-teal-500/20 transition">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Gluco<span className="text-teal-400">Twin</span></span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-teal-500/10 text-teal-400 rounded-full border border-teal-500/20">Digital Twin 2026</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Early Glucose Spike Prediction</p>
          </div>
        </Link>

        {/* Patient Selection & Navigation */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* Patient Selector */}
              <div className="relative flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200">
                <User className="w-4 h-4 text-teal-400 mr-2 shrink-0" />
                <span className="text-slate-400 mr-1.5 hidden sm:inline">Active Patient:</span>
                <select
                  value={activePatient || ''}
                  onChange={(e) => onSelectPatient(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-4"
                >
                  {patients.map((p) => (
                    <option key={p.patient_id} value={p.patient_id} className="bg-slate-900 text-white">
                      {p.patient_id} — {p.name} ({p.risk_level} Risk)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2" />
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  onLogout();
                  navigate('/login');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg border border-slate-700/40 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Exit Demo</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition shadow-md shadow-teal-600/20"
            >
              Launch Demo Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
