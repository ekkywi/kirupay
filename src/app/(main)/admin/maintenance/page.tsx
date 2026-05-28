import type { Metadata } from "next";
import { AdminMetricCard, AdminSurface } from "@/components/admin/AdminUI";
import { getPlatformMaintenanceState, getPlatformOperationsSnapshot } from "@/lib/platform-maintenance";
import { AlertTriangle, CheckCircle2, DatabaseZap, RefreshCcw, Server, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { MaintenanceFlash, MaintenanceHeader } from "./_shared";

export const metadata: Metadata = {
  title: "Admin Maintenance",
};

export default async function AdminMaintenanceOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [maintenance, snapshot] = await Promise.all([
    getPlatformMaintenanceState(),
    getPlatformOperationsSnapshot(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MaintenanceFlash errorMessage={resolvedSearchParams.error} successMessage={resolvedSearchParams.success} />
      <MaintenanceHeader description="Choose a maintenance module: global controls, RPC health, or recovery workflows." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <AdminMetricCard
          icon={maintenance.enabled ? AlertTriangle : CheckCircle2}
          label="Maintenance state"
          value={maintenance.enabled ? "ACTIVE" : "OFF"}
          detail={maintenance.enabled ? "Checkout is paused for public users." : "Payment flow is available."}
          tone={maintenance.enabled ? "red" : "emerald"}
        />
        <AdminMetricCard
          icon={DatabaseZap}
          label="Pending transactions"
          value={snapshot.pendingTransactions.toString()}
          detail="Transactions waiting for confirmation"
          tone="amber"
        />
        <AdminMetricCard
          icon={RefreshCcw}
          label="Failed webhooks"
          value={snapshot.failedWebhookLogs.toString()}
          detail="Retry queue from webhook logs"
          tone="red"
        />
        <AdminMetricCard
          icon={Users}
          label="Active merchants"
          value={snapshot.activeMerchants.toString()}
          detail="Merchant accounts still receiving traffic"
          tone="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/admin/maintenance/control">
          <AdminSurface className="h-full">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
              <Wrench className="h-4 w-4 text-red-500" />
              Maintenance control
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Toggle maintenance mode, update message, and set maintenance ETA.</p>
          </AdminSurface>
        </Link>

        <Link href="/admin/maintenance/rpc-health">
          <AdminSurface className="h-full">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
              <Server className="h-4 w-4 text-emerald-500" />
              RPC health
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Run endpoint checks, view latency summaries, and inspect recent incidents.</p>
          </AdminSurface>
        </Link>

        <Link href="/admin/maintenance/recovery">
          <AdminSurface className="h-full">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
              <RefreshCcw className="h-4 w-4 text-amber-500" />
              Recovery center
            </div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Resync transactions and retry failed webhook deliveries.</p>
          </AdminSurface>
        </Link>
      </div>
    </div>
  );
}