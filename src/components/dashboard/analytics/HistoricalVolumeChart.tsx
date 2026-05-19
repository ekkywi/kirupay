// src/components/analytics/HistoricalVolumeChart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface HistoricalVolumePoint {
  month: string;
  PAID: number;
  PENDING: number;
  FAILED: number;
}

export function HistoricalVolumeChart({ data }: { data: HistoricalVolumePoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/10">
        No historical volume yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Historical chart butuh lebih banyak ruang, kita beri height={350} */}
      <ResponsiveContainer width="100%" height={350} minWidth={0} minHeight={0}>
        <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.18} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} cursor={{ fill: '#94a3b8', opacity: 0.12 }} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="PAID" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
          <Bar dataKey="PENDING" stackId="a" fill="#eab308" />
          <Bar dataKey="FAILED" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
