import { DeveloperView } from "@/components/dashboard/developers/DeveloperView";
import { getCurrentMerchantBusinessContext } from "@/lib/auth-service";
import { redirect } from "next/navigation";

export default async function DevelopersPage() {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) redirect("/business");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Developer Controls</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage API credentials, webhook logs, and integration references for your active business.
        </p>
      </div>

      <DeveloperView
        merchant={{
          businessId: ctx.business.id,
          apiKey: ctx.business.credentials?.apiKey || null,
          webhookSecret: ctx.business.credentials?.webhookSecret || null,
          webhookUrl: ctx.business.credentials?.webhookUrl || null,
        }}
        canManage={ctx.membership.role === "OWNER" || ctx.membership.role === "ADMIN"}
      />
    </div>
  );
}
