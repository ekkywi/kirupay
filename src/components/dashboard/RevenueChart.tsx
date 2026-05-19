// src/components/dashboard/RevenueChart.tsx
"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface RevenueChartProps {
  data: { date: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-gray-400 text-sm">
        No transaction data available yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(value) => `${value}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#2A2A2A', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            // UBAH LABEL REVENUE MENJADI NET REVENUE DI SINI
            formatter={(value) => [`${Number(value ?? 0).toFixed(4)} SOL`, 'Net Revenue']}
          />
          <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
