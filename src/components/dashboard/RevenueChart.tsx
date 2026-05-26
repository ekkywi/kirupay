// src/components/dashboard/RevenueChart.tsx
"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMemo, useState } from "react";
import { formatCurrencyDisplay } from "@/lib/currency-format";

interface RevenueChartProps {
  data: Array<{ date: string } & Record<string, number>>;
  series: Array<{ key: string; label: string; color: string }>;
}

export function RevenueChart({ data, series }: RevenueChartProps) {
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  const activeSeries = useMemo(
    () => series.filter((item) => !hiddenSeries.includes(item.key)),
    [hiddenSeries, series]
  );

  if (!data || data.length === 0 || series.length === 0) {
    return (
      <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-gray-400 text-sm">
        No paid transaction data available yet.
      </div>
    );
  }

  const toggleSeries = (key: string) => {
    setHiddenSeries((current) => (
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    ));
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <div className="mb-4 flex flex-wrap gap-2">
        {series.map((item) => {
          const isHidden = hiddenSeries.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleSeries(item.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                isHidden
                  ? "border-slate-200 text-slate-400 dark:border-white/10 dark:text-slate-500"
                  : "border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-200"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </button>
          );
        })}
      </div>
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {series.map((item) => (
              <linearGradient key={item.key} id={`color-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={item.color} stopOpacity={0.28} />
                <stop offset="95%" stopColor={item.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.3} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(value) => `${value}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#2A2A2A', borderRadius: '12px', color: '#fff' }}
            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            formatter={(value, _name, item) => [formatCurrencyDisplay(item.dataKey as string, Number(value ?? 0)), "Net Revenue"]}
          />
          {activeSeries.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              stroke={item.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#color-${item.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
