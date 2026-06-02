"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

interface PeakHourPoint {
  hour: string;
  count: number;
}

export function PeakHoursChart({ data, peakHour }: { data: PeakHourPoint[]; peakHour?: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-white/10">
        No hourly payment data yet.
      </div>
    );
  }

  const peakPoint = peakHour ? data.find((item) => item.hour === peakHour) : null;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="peak-hour-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.18} />
          <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0B0F17", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
            itemStyle={{ color: "#f59e0b", fontWeight: "bold" }}
            labelFormatter={(label) => `${label}:00`}
            formatter={(value) => [`${Number(value ?? 0)} transactions`, "Paid"]}
          />
          <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2.8} fillOpacity={1} fill="url(#peak-hour-gradient)" />
          {peakPoint ? (
            <ReferenceDot x={peakPoint.hour} y={peakPoint.count} r={4} fill="#f59e0b" stroke="#fff" strokeWidth={1.5} ifOverflow="discard" />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
