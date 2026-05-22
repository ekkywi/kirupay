"use client";

import { Activity, CheckCircle2, Clock, RefreshCw, Search, XCircle } from "lucide-react";
import { useWebhookLogs, type WebhookLog } from "@/hooks/api/merchant/useWebhookLogs";
import { formatLocalDateTime } from "@/lib/local-time";

function formatPayload(payload: string) {
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
}

function getStatusLabel(log: WebhookLog) {
  if (!log.status) return "Connection failed";
  if (log.status >= 200 && log.status < 300) return `${log.status} Delivered`;
  return `${log.status} Failed`;
}

function getStatusClasses(status: number | null) {
  if (status && status >= 200 && status < 300) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  }

  return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
}

export function TabWebhookLogs({ activeTab }: { activeTab: string }) {
  const { logs, isLoadingLogs, selectedLog, setSelectedLog, fetchLogs } = useWebhookLogs(activeTab);
  const successfulDeliveries = logs.filter((log) => log.status && log.status >= 200 && log.status < 300).length;
  const failedDeliveries = logs.length - successfulDeliveries;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {selectedLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-[#0B0F17]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Webhook delivery</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{selectedLog.event}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatLocalDateTime(selectedLog.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
                aria-label="Close webhook detail"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</p>
                  <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClasses(selectedLog.status)}`}>
                    {getStatusLabel(selectedLog)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Endpoint</p>
                  <p className="mt-2 truncate font-mono text-xs text-slate-700 dark:text-slate-300">{selectedLog.url || "Merchant webhook URL"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Event ID</p>
                  <p className="mt-2 truncate font-mono text-xs text-slate-700 dark:text-slate-300">{selectedLog.id}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Request payload</p>
                <pre className="overflow-x-auto rounded-xl border border-slate-900 bg-[#0B0F17] p-4 text-[11px] leading-relaxed text-emerald-200 dark:border-white/10">
                  <code>{formatPayload(selectedLog.payload)}</code>
                </pre>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Server response</p>
                <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] leading-relaxed text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                  <code>{selectedLog.response || "No response data"}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Latest events", value: logs.length.toString(), detail: "Most recent deliveries", icon: Activity, tone: "blue" },
          { label: "Delivered", value: successfulDeliveries.toString(), detail: "2xx webhook responses", icon: CheckCircle2, tone: "emerald" },
          { label: "Needs review", value: failedDeliveries.toString(), detail: "Failed or missing responses", icon: XCircle, tone: "red" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
            <item.icon
              className={`mb-4 h-5 w-5 ${
                item.tone === "emerald"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : item.tone === "red"
                    ? "text-red-600 dark:text-red-400"
                    : "text-blue-600 dark:text-blue-400"
              }`}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className="mt-2 font-mono text-xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Delivery History</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Webhook events</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest 50 webhook attempts sent to your configured endpoint.</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Displayed in local time.</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchLogs()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingLogs ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {isLoadingLogs && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <RefreshCw className="mb-3 h-6 w-6 animate-spin" />
            <p className="text-sm font-semibold">Loading webhook logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06]">
              <Search className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No webhook logs yet</p>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Successful checkout events will appear here after Trezalink delivers them to your merchant webhook endpoint.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-4">Delivery time</th>
                  <th className="px-5 py-4">Event</th>
                  <th className="px-5 py-4">Endpoint</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{formatLocalDateTime(log.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:bg-white/[0.06] dark:text-slate-300">{log.event}</code>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{log.url || "Merchant endpoint"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClasses(log.status)}`}>{getStatusLabel(log)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15"
                      >
                        View JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
