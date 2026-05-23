// src/components/dashboard/DashboardShell.tsx
"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface ShellMerchant {
  businessName?: string | null;
  email?: string | null;
  actorType: "merchant" | "internal";
}

export function DashboardShell({ 
  merchant, 
  children 
}: { 
  merchant: ShellMerchant,
  transactions: unknown[],
  totalRevenue: number,
  children: ReactNode 
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-[#080B12] dark:text-slate-100 transition-colors duration-300">
      <Sidebar actorType={merchant.actorType} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNav merchant={merchant} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-4 pt-5 pb-24 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
