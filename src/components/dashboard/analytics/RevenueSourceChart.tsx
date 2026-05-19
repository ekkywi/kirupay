// src/components/dashboard/analytics/RevenueSourceChart.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6"]; 

// PASTIKAN MENGGUNAKAN 'export function', BUKAN 'export default function'
export function RevenueSourceChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/10">
        No paid source data yet.
      </div>
    );
  }

  return (
    // Kita berikan style height absolut di div pembungkusnya
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value) => [`${Number(value ?? 0)} Orders`, 'Total']} />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
