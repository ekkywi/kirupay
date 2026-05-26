"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  PAID: "#22c55e",
  PENDING: "#eab308",
  FAILED: "#ef4444",
};

interface StatusPoint {
  name: string;
  value: number;
}

export function StatusDonutChart({ data, title }: { data: StatusPoint[]; title?: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/10">
        No transaction status data yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={62} outerRadius={88} paddingAngle={3} dataKey="value" cornerRadius={8}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#64748b"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#0B0F17", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value, label) => [`${Number(value ?? 0)} transactions`, String(label ?? "Status")]}
            labelFormatter={() => title ?? "Status"}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
