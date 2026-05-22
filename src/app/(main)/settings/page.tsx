import type { Metadata } from "next";
// src/app/dashboard/settings/page.tsx
import { SettingsView } from "@/components/dashboard/settings/SettingsView";
import { LocalTime } from "@/components/common/LocalTime";
import { getCurrentMerchant } from "@/lib/auth-service";
import { CalendarDays, CheckCircle2, Globe2, Settings, ShieldCheck, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/login");

  const walletConnected = Boolean(merchant.walletAddress && !merchant.walletAddress.includes("pending"));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <Settings className="h-4 w-4" />
            Account settings
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Merchant profile and operational controls
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure checkout identity, settlement wallet, webhook endpoint, and account readiness.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Merchant ID</p>
          <p className="mt-1 max-w-[240px] truncate font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">{merchant.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            icon: CheckCircle2,
            label: "Account",
            value: merchant.isActive ? "Active" : "Paused",
            detail: merchant.emailVerified ? "Email verified" : "Email pending",
            tone: merchant.isActive ? "emerald" : "amber",
          },
          {
            icon: Wallet,
            label: "Payout wallet",
            value: walletConnected ? "Connected" : "Pending",
            detail: "Primary settlement destination",
            tone: walletConnected ? "emerald" : "amber",
          },
          {
            icon: Globe2,
            label: "Webhook",
            value: merchant.webhookUrl ? "Configured" : "Not set",
            detail: merchant.webhookSecret ? "Signing enabled" : "Secret will auto-generate",
            tone: merchant.webhookUrl ? "blue" : "amber",
          },
          {
            icon: CalendarDays,
            label: "Since",
            value: <LocalTime value={merchant.createdAt} preset="monthYear" withTitle />,
            detail: "Merchant onboarding date",
            tone: "blue",
          },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
            <metric.icon
              className={`mb-4 h-5 w-5 ${
                metric.tone === "emerald"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : metric.tone === "amber"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-blue-600 dark:text-blue-400"
              }`}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
            <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{metric.value}</div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-100">Enterprise readiness</h3>
            <p className="mt-1 text-xs leading-relaxed text-blue-700 dark:text-blue-200">
              These settings directly affect checkout branding, payout routing, and event delivery for live payment operations.
            </p>
          </div>
        </div>
      </div>

      <SettingsView merchant={merchant} />
    </div>
  );
}