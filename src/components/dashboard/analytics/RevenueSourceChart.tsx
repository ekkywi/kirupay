"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const FALLBACK_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b"];

type SourcePoint = { name: string; value: number; color?: string };

export function RevenueSourceChart({ data }: { data: SourcePoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/10">
        No paid source data yet.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={62} outerRadius={88} paddingAngle={4} dataKey="value" cornerRadius={8}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#0B0F17", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value) => [`${Number(value ?? 0)} orders`, "Paid"]}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
