import type { Metadata } from "next";
import { AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import { getPlatformOperationsSnapshot } from "@/lib/platform-maintenance";
import { ArrowUpRight, DatabaseZap, RefreshCcw, Server } from "lucide-react";
import Link from "next/link";
import { resyncTransactionAction, retryWebhookAction } from "../actions";
import { MaintenanceFlash, MaintenanceHeader } from "../_shared";

export const metadata: Metadata = {
  title: "Admin Maintenance Recovery",
};

type OperationsSnapshot = Awaited<ReturnType<typeof getPlatformOperationsSnapshot>>;
type FailedWebhookLog = OperationsSnapshot["recentFailedWebhookLogs"][number];

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function AdminMaintenanceRecoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; transactionId?: string; signature?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const snapshot = await getPlatformOperationsSnapshot();

  const prefillTransactionId = resolvedSearchParams.transactionId ?? "";
  const prefillSignature = resolvedSearchParams.signature ?? "";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MaintenanceFlash errorMessage={resolvedSearchParams.error} successMessage={resolvedSearchParams.success} />
      <MaintenanceHeader description="Recover stale transaction states and retry failed webhook deliveries." />

      <AdminSurface padded={false} className="h-fit">
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <AdminSectionHeader
            eyebrow="Recovery center"
            title="Manual resync and webhook retry"
            description="Use these tools when a payment exists on-chain but the application state or delivery log is stale."
          />
        </div>

        <div className="space-y-5 p-5 lg:p-6">
          <form action={resyncTransactionAction} className="space-y-4 dashboard-muted-panel rounded-2xl p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <input type="hidden" name="returnTo" value="/admin/maintenance/recovery" />
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
              <DatabaseZap className="h-4 w-4 text-red-500" />
              Manual transaction resync
            </div>

            <div className="grid gap-3">
              <input
                type="text"
                name="transactionId"
                defaultValue={prefillTransactionId}
                placeholder="Transaction ID"
                className="w-full dashboard-secondary px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 dark:border-white/10 dark:bg-white/[0.045] dark:text-white"
              />
              <input
                type="text"
                name="signature"
                defaultValue={prefillSignature}
                placeholder="Blockchain signature (optional if already stored)"
                className="w-full dashboard-secondary px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 dark:border-white/10 dark:bg-white/[0.045] dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Best practice: start with Transaction ID. Signature is optional if the transaction already has a saved on-chain signature.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  name="buyerWallet"
                  placeholder="Buyer wallet (optional)"
                  className="w-full dashboard-secondary px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 dark:border-white/10 dark:bg-white/[0.045] dark:text-white"
                />
                <input
                  type="text"
                  name="walletProvider"
                  placeholder="Wallet provider (optional)"
                  className="w-full dashboard-secondary px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 dark:border-white/10 dark:bg-white/[0.045] dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 sm:w-auto"
            >
              <RefreshCcw className="h-4 w-4" />
              Resync and notify merchant
            </button>
          </form>

          <div className="space-y-4 dashboard-muted-panel rounded-2xl p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pending transaction queue</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quick-start resync from latest pending transactions.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <DatabaseZap className="h-3.5 w-3.5" />
                {snapshot.pendingTransactions} pending
              </div>
            </div>

            <div className="overflow-hidden dashboard-card dark:border-white/10 dark:bg-white/[0.045]">
              {snapshot.recentPendingTransactions.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No pending transactions found.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {snapshot.recentPendingTransactions.map((tx) => (
                    <div key={tx.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          {tx.business.name || "Unnamed business"} · {tx.amount.toFixed(4)} {tx.currency}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{tx.id}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Order {tx.orderId} • {formatDateTime(tx.createdAt)} • {tx.txSignature ? "Has signature" : "Signature missing"}
                        </p>
                      </div>

                      <Link
                        href={`/admin/maintenance/recovery?transactionId=${encodeURIComponent(tx.id)}${tx.txSignature ? `&signature=${encodeURIComponent(tx.txSignature)}` : ""}`}
                        className="inline-flex w-full items-center justify-center gap-2 dashboard-secondary px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] sm:w-auto"
                      >
                        Prefill resync form
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 dashboard-muted-panel rounded-2xl p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Failed webhook queue</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{snapshot.failedWebhookLogs} delivery attempts need attention.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Server className="h-3.5 w-3.5" />
                {snapshot.webhookTotal} total logs
              </div>
            </div>

            <div className="overflow-hidden dashboard-card dark:border-white/10 dark:bg-white/[0.045]">
              {snapshot.recentFailedWebhookLogs.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No failed webhook logs found.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {snapshot.recentFailedWebhookLogs.map((log: FailedWebhookLog) => (
                    <div key={log.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{log.business.name || "Unnamed business"}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{log.business.contactEmail || "No contact email"}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {log.event} • {log.status ?? "Timeout"} • {formatDateTime(log.createdAt)}
                        </p>
                      </div>

                      <form action={retryWebhookAction} className="w-full sm:w-auto">
                        <input type="hidden" name="logId" value={log.id} />
                        <input type="hidden" name="returnTo" value="/admin/maintenance/recovery" />
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 dashboard-secondary px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] sm:w-auto"
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Retry delivery
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminSurface>
    </div>
  );
}
