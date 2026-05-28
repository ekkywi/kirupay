// src/components/dashboard/DashboardShell.tsx
"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface ShellMerchant {
  businessName?: string | null;
  displayName?: string | null;
  email?: string | null;
  activeBusinessId?: string | null;
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
    <div className="relative isolate flex h-screen overflow-hidden bg-[#f6f4ee] text-slate-950 transition-colors duration-300 dark:bg-[#040807] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[#f6f4ee] dark:bg-[#040807]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(52,211,153,0.28),transparent_30%),radial-gradient(circle_at_86%_16%,rgba(34,211,238,0.2),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.62)_0%,rgba(246,244,238,0.86)_38%,rgba(239,235,225,0.96)_100%)] dark:bg-[radial-gradient(circle_at_12%_8%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_86%_14%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,rgba(7,28,23,0.92)_0%,rgba(4,8,7,0.97)_48%,rgba(2,6,23,0.98)_100%)]" />
        <div className="absolute -left-28 top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-emerald-300/28 blur-3xl dark:bg-emerald-400/10" />
        <div className="absolute -right-32 top-20 h-[30rem] w-[30rem] rounded-full bg-cyan-300/22 blur-3xl dark:bg-cyan-400/8" />
        <div className="absolute bottom-[-16rem] left-1/2 h-[32rem] w-[64rem] -translate-x-1/2 rounded-full bg-lime-200/18 blur-3xl dark:bg-emerald-900/10" />
        <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_82%_58%_at_50%_0%,black_18%,transparent_78%)] dark:opacity-[0.14] dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_88%_62%_at_50%_18%,transparent_0%,transparent_58%,rgba(56,45,28,0.1)_100%)] dark:bg-[radial-gradient(ellipse_88%_62%_at_50%_18%,transparent_0%,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <Sidebar actorType={merchant.actorType} />

      <div className="relative z-10 flex h-screen flex-1 flex-col overflow-hidden">
        <TopNav merchant={merchant} />
        
        <main className="relative flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1520px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
