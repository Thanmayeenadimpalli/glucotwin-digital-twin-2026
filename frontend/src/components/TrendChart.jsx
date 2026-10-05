import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

export default function TrendChart({ data, dataKey, title, strokeColor, threshold, unit }) {
  if (!data || data.length === 0) return null;

  // Format timestamp string for clean chart axis
  const formattedData = data.map((d) => {
    let tStr = d.timestamp || '';
    if (tStr.includes(' ')) {
      tStr = tStr.split(' ')[1].slice(0, 5);
    }
    return {
      ...d,
      timeLabel: tStr
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        {threshold && (
          <span className="text-[11px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            Spike Threshold: {threshold} {unit}
          </span>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc'
              }}
            />
            {threshold && (
              <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Spike Level (180)', fill: '#ef4444', fontSize: 10, position: 'top' }} />
            )}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor || '#14b8a6'}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
