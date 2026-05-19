import { AdminMetricCard, AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import { getPlatformMaintenanceState, getPlatformOperationsSnapshot } from "@/lib/platform-maintenance";
import { AlertTriangle, ArrowUpRight, CheckCircle2, DatabaseZap, RefreshCcw, Server, ShieldAlert, Signal, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { resyncTransactionAction, retryWebhookAction, saveMaintenanceSettingsAction } from "./actions";

type OperationsSnapshot = Awaited<ReturnType<typeof getPlatformOperationsSnapshot>>;
type FailedWebhookLog = OperationsSnapshot["recentFailedWebhookLogs"][number];

function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function toDateTimeLocalValue(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default async function AdminMaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; transactionId?: string; signature?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams.error;
  const successMessage = resolvedSearchParams.success;
  const prefillTransactionId = resolvedSearchParams.transactionId ?? "";
  const prefillSignature = resolvedSearchParams.signature ?? "";
  const [maintenance, snapshot] = await Promise.all([
    getPlatformMaintenanceState(),
    getPlatformOperationsSnapshot(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {successMessage}
        </div>
      )}

      <AdminSurface className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            <ShieldAlert className="h-4 w-4" />
            Platform operations
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Maintenance control center
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pause the payment flow safely, update the public maintenance message, and recover failed webhooks or transaction states.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/admin/overview"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
          >
            Overview
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/status"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Public status
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </AdminSurface>

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
        <AdminSurface padded={false} className="h-fit">
          <div className="border-b border-slate-200 p-5 dark:border-white/10">
            <AdminSectionHeader
              eyebrow="Maintenance mode"
              title="Global switch and message"
              description="This toggle blocks the public payment flow while keeping the admin panel available."
            />
          </div>

          <form action={saveMaintenanceSettingsAction} className="space-y-6 p-5 lg:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex min-h-[132px] cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <input
                  type="checkbox"
                  name="enabled"
                  value="on"
                  defaultChecked={maintenance.enabled}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-950 dark:text-white">Enable maintenance</span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                    Public checkout and API creation requests will return maintenance responses.
                  </span>
                </span>
              </label>

              <div className="min-h-[132px] rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Current schedule</p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                  {maintenance.maintenanceEndsAt ? formatDateTime(maintenance.maintenanceEndsAt) : "Not scheduled"}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Last updated {formatDateTime(maintenance.updatedAt)}
                  {maintenance.updatedByEmail ? ` by ${maintenance.updatedByEmail}` : ""}.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Maintenance message</span>
                <textarea
                  name="message"
                  defaultValue={maintenance.message}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-red-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  placeholder="Describe the issue or estimated return time..."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Estimated return</span>
                <input
                  type="datetime-local"
                  name="maintenanceEndsAt"
                  defaultValue={toDateTimeLocalValue(maintenance.maintenanceEndsAt)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition-colors focus:border-red-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leave empty if you do not want to show an estimate.
                </p>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <Wrench className="h-4 w-4" />
                Save maintenance settings
              </button>
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
                <Signal className="h-4 w-4" />
                Admin-only state control
              </div>
            </div>
          </form>
        </AdminSurface>

        <AdminSurface padded={false} className="h-fit">
          <div className="border-b border-slate-200 p-5 dark:border-white/10">
            <AdminSectionHeader
              eyebrow="Recovery center"
              title="Manual resync and webhook retry"
              description="Use these tools when a payment exists on-chain but the application state or delivery log is stale."
            />
          </div>

          <div className="space-y-5 p-5 lg:p-6">
            <form action={resyncTransactionAction} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 dark:border-white/10 dark:bg-[#0B0F17] dark:text-white"
                />
                <input
                  type="text"
                  name="signature"
                  defaultValue={prefillSignature}
                  placeholder="Blockchain signature (optional if already stored)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 dark:border-white/10 dark:bg-[#0B0F17] dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Best practice: start with Transaction ID. Signature is optional if the transaction already has a saved on-chain signature.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    name="buyerWallet"
                    placeholder="Buyer wallet (optional)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 dark:border-white/10 dark:bg-[#0B0F17] dark:text-white"
                  />
                  <input
                    type="text"
                    name="walletProvider"
                    placeholder="Wallet provider (optional)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-red-500 dark:border-white/10 dark:bg-[#0B0F17] dark:text-white"
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

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pending transaction queue</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Quick-start resync from latest pending transactions.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <DatabaseZap className="h-3.5 w-3.5" />
                  {snapshot.pendingTransactions} pending
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F17]">
                {snapshot.recentPendingTransactions.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No pending transactions found.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-white/10">
                    {snapshot.recentPendingTransactions.map((tx) => (
                      <div key={tx.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            {tx.merchant.businessName} · {tx.amount.toFixed(4)} {tx.currency}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {tx.id}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Order {tx.orderId} • {formatDateTime(tx.createdAt)} • {tx.txSignature ? "Has signature" : "Signature missing"}
                          </p>
                        </div>

                        <Link
                          href={`/admin/maintenance?transactionId=${encodeURIComponent(tx.id)}${tx.txSignature ? `&signature=${encodeURIComponent(tx.txSignature)}` : ""}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] sm:w-auto"
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

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Failed webhook queue</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {snapshot.failedWebhookLogs} delivery attempts need attention.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  <Server className="h-3.5 w-3.5" />
                  {snapshot.webhookTotal} total logs
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F17]">
                {snapshot.recentFailedWebhookLogs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No failed webhook logs found.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-white/10">
                    {snapshot.recentFailedWebhookLogs.map((log: FailedWebhookLog) => (
                      <div key={log.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{log.merchant.businessName}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{log.merchant.email}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {log.event} • {log.status ?? "Timeout"} • {formatDateTime(log.createdAt)}
                          </p>
                        </div>

                        <form action={retryWebhookAction} className="w-full sm:w-auto">
                          <input type="hidden" name="logId" value={log.id} />
                          <button
                            type="submit"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] sm:w-auto"
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
    </div>
  );
}
