import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function FeatureImportance({ factors, title }) {
  if (!factors || factors.length === 0) return null;

  const chartData = factors.map((f) => ({
    name: f.readable_name || f.feature,
    impact: Math.abs(f.impact || f.value || 0),
    rawImpact: f.impact || 0,
    direction: f.direction || 'influences risk'
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">{title || 'SHAP Feature Contribution Breakdown'}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 11 }} width={120} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc'
              }}
              formatter={(val, name, item) => [`${val.toFixed(3)} (${item.payload.direction})`, 'SHAP Attribution']}
            />
            <Bar dataKey="impact" fill="#14b8a6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
