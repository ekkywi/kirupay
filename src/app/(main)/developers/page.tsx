// src/app/dashboard/developers/page.tsx
import { DeveloperView } from "@/components/dashboard/developers/DeveloperView";
import { getCurrentMerchant } from "@/lib/auth-service";
import { ArrowUpRight, Code2, KeyRound, Radio, ShieldCheck, Terminal } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DevelopersPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) redirect("/login");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <Terminal className="h-4 w-4" />
            Developer console
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            API credentials and webhook operations
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage live API keys, verify webhook signing, inspect deliveries, and copy integration examples.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/docs" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]">
            Public docs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/payments" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            View ledger
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { icon: KeyRound, label: "API access", value: merchant.apiKey ? "Live key" : "Missing", detail: "Bearer checkout auth", tone: "blue" },
          { icon: Radio, label: "Webhook secret", value: merchant.webhookSecret ? "Configured" : "Generate", detail: "HMAC verification", tone: "emerald" },
          { icon: Code2, label: "Endpoint", value: "POST", detail: "/api/v1/checkout", tone: "blue" },
          { icon: ShieldCheck, label: "Settlement", value: "SOL", detail: "wallet-direct flow", tone: "emerald" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
            <metric.icon className={`mb-4 h-5 w-5 ${metric.tone === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
            <p className="mt-2 font-mono text-xl font-semibold text-slate-950 dark:text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      <DeveloperView merchant={merchant} />
    </div>
  );
}
