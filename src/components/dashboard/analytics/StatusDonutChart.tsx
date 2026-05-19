// src/components/analytics/StatusDonutChart.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  PAID: "#22c55e",
  PENDING: "#eab308",
  FAILED: "#ef4444",
};

interface StatusPoint {
  name: string;
  value: number;
}

export function StatusDonutChart({ data }: { data: StatusPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/10">
        No transaction status data yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Ubah height="100%" menjadi height={300} */}
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#888"} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
