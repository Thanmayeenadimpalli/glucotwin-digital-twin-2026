import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Watch,
  TrendingUp,
  BrainCircuit,
  Sliders,
  FileText,
  History,
  Info,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activePatient }) {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: `/dashboard/${activePatient}` },
    { label: 'Digital Twin Profile', icon: UserCheck, path: `/profile/${activePatient}` },
    { label: 'Wearable Data', icon: Watch, path: `/wearables/${activePatient}` },
    { label: 'Glucose Forecast', icon: TrendingUp, path: `/prediction/${activePatient}` },
    { label: 'Explainability (SHAP)', icon: BrainCircuit, path: `/explainability/${activePatient}` },
    { label: 'Twin Simulation Engine', icon: Sliders, path: `/simulation/${activePatient}` },
    { label: 'Clinical Summary Report', icon: FileText, path: `/reports/${activePatient}` },
    { label: 'Prediction History', icon: History, path: `/history/${activePatient}` },
    { label: 'About & Methodology', icon: Info, path: '/about' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 hidden md:block min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <p className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
