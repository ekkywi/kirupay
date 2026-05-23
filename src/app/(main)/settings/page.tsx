import type { Metadata } from "next";
import { LocalTime } from "@/components/common/LocalTime";
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import { CheckCircle2, Mail, Settings, ShieldCheck, User } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) redirect("/login");
  const merchant = ctx.merchant;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <Settings className="h-4 w-4" />
            Personal settings
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Merchant profile settings</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This page is user-level only. Business wallet and integrations are managed in Business Hub.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: User,
            label: "Display name",
            value: merchant.businessName || "Not set",
            detail: "Personal account identity",
          },
          {
            icon: Mail,
            label: "Email",
            value: merchant.email,
            detail: merchant.emailVerified ? "Verified" : "Verification pending",
          },
          {
            icon: CheckCircle2,
            label: "Status",
            value: merchant.isActive ? "Active" : "Paused",
            detail: "Merchant account state",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
            <item.icon className="mb-4 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-100">Account timeline</h3>
            <p className="mt-1 text-xs leading-relaxed text-blue-700 dark:text-blue-200">
              Joined <LocalTime value={merchant.createdAt} preset="date" withTitle />. Active business operations are available from the Business Hub menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
