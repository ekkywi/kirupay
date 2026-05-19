// src/components/dashboard/StatCard.tsx
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend: string;
  trendUp?: boolean;
  description?: string;
}

export const StatCard = ({ label, value, icon, trend, trendUp, description = "vs last period" }: StatProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="p-5 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl transition-all shadow-sm shadow-slate-200/60 dark:shadow-none hover:border-blue-200 dark:hover:border-blue-500/25 group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-300 transition-colors">
        {icon}
      </div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em] mt-1 text-right">
        {label}
      </p>
    </div>
    
    <div className="space-y-1">
      <h3 className="text-2xl font-semibold text-slate-950 dark:text-white tracking-tight font-mono">
        {value}
      </h3>
      
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
          trendUp 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' 
            : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
        }`}>
          {trendUp ? '▲' : '▼'} {trend}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {description}
        </span>
      </div>
    </div>
  </motion.div>
);
