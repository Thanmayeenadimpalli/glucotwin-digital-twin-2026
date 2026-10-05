import React from 'react';

export default function VitalCard({ title, value, unit, icon: Icon, colorClass, subtitle, statusTag }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl bg-slate-800/80 ${colorClass || 'text-teal-400'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
          {unit && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
        </div>
        {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {statusTag && (
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
          <span className="text-[11px] font-semibold text-teal-400">{statusTag}</span>
        </div>
      )}
    </div>
  );
}
