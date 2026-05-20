import { AdminSectionHeader, AdminSurface } from "@/components/admin/AdminUI";
import AutoRefresh from "@/components/admin/AutoRefresh";
import { getRpcHealthSummary, type IncidentSeverity, type RpcHealthSnapshot } from "@/lib/rpc-health";
import { Clock3, RefreshCcw, Signal } from "lucide-react";
import { runRpcHealthCheckAction } from "../actions";
import { MaintenanceFlash, MaintenanceHeader } from "../_shared";

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "Not checked yet";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function formatLatency(value: number | null | undefined) {
  if (typeof value !== "number") return "n/a";
  return `${value} ms`;
}

function getRpcStatusTone(status: RpcHealthSnapshot["status"] | null | undefined) {
  if (status === "HEALTHY") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (status === "DEGRADED") return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
}

function endpointLabel(endpointType: RpcHealthSnapshot["endpointType"]) {
  return endpointType === "PRIMARY" ? "Primary RPC" : "Fallback RPC";
}

function activeEndpointLabel(endpointType: "PRIMARY" | "FALLBACK" | "UNKNOWN") {
  if (endpointType === "PRIMARY") return "Using Primary";
  if (endpointType === "FALLBACK") return "Using Fallback";
  return "Unknown";
}

function formatDuration(from: Date, to: Date) {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins === 0 ? `${hours}h` : `${hours}h ${remMins}m`;
}

function incidentSeverityTone(severity: IncidentSeverity) {
  if (severity === "CRITICAL") return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
}

export default async function AdminMaintenanceRpcHealthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rpcHealth = await getRpcHealthSummary();
  const latestRpc = rpcHealth.latestPrimary ?? rpcHealth.latestFallback;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AutoRefresh intervalMs={30000} />
      <MaintenanceFlash errorMessage={resolvedSearchParams.error} successMessage={resolvedSearchParams.success} />
      <MaintenanceHeader description="Observe RPC health in real time and inspect recent endpoint incidents." />

      {rpcHealth.configError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          {rpcHealth.configError}
        </div>
      )}
      {rpcHealth.traffic.configError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          {rpcHealth.traffic.configError}
        </div>
      )}
      <div
        className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${
          rpcHealth.rateLimitAlert.level === "CRITICAL"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
            : rpcHealth.rateLimitAlert.level === "WARNING"
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
        }`}
      >
        Rate-limit alert: <span className="font-bold">{rpcHealth.rateLimitAlert.level}</span> · {rpcHealth.rateLimitAlert.message}
      </div>

      <AdminSurface padded={false}>
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <AdminSectionHeader
            eyebrow="RPC health"
            title="Live endpoint monitor"
            description="Run on-demand checks and review historical health for your Solana RPC infrastructure."
          />
        </div>

        <div className="space-y-5 p-5 lg:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current status</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Latest snapshot from {latestRpc ? endpointLabel(latestRpc.endpointType) : "configured endpoints"}.
                  </p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getRpcStatusTone(latestRpc?.status)}`}>
                  <Signal className="h-3.5 w-3.5" />
                  {latestRpc?.status ?? "NO DATA"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Latency" value={formatLatency(latestRpc?.latencyMs)} />
                <Metric label="Last checked" value={formatDateTime(latestRpc?.checkedAt)} />
                <Metric label="1h success rate" value={`${rpcHealth.oneHour.successRate.toFixed(1)}%`} />
                <Metric label="24h p95 latency" value={formatLatency(rpcHealth.twentyFourHours.p95LatencyMs)} />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Metric
                  label="1h rate-limited"
                  value={`${rpcHealth.oneHour.rateLimitedCount} (${rpcHealth.oneHour.rateLimitedRate.toFixed(1)}%)`}
                />
                <Metric
                  label="24h rate-limited"
                  value={`${rpcHealth.twentyFourHours.rateLimitedCount} (${rpcHealth.twentyFourHours.rateLimitedRate.toFixed(1)}%)`}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <form action={runRpcHealthCheckAction}>
                  <input type="hidden" name="returnTo" value="/admin/maintenance/rpc-health" />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Run health check now
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Window summary</p>
              <div className="mt-4 space-y-3">
                <WindowCard
                  label="Last 1 hour"
                  checks={rpcHealth.oneHour.totalChecks}
                  down={rpcHealth.oneHour.downtimeCount}
                  degraded={rpcHealth.oneHour.degradedCount}
                  rateLimited={rpcHealth.oneHour.rateLimitedCount}
                />
                <WindowCard
                  label="Last 24 hours"
                  checks={rpcHealth.twentyFourHours.totalChecks}
                  down={rpcHealth.twentyFourHours.downtimeCount}
                  degraded={rpcHealth.twentyFourHours.degradedCount}
                  rateLimited={rpcHealth.twentyFourHours.rateLimitedCount}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Active RPC (Live Traffic)</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Shows which RPC endpoint is currently active for routing traffic, based on the latest health check results and failover logic.
                </p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${getRpcStatusTone(rpcHealth.traffic.activeEndpointType === "UNKNOWN" ? null : rpcHealth.traffic.activeEndpointType === "PRIMARY" ? "HEALTHY" : "DEGRADED")}`}>
                <Signal className="h-3.5 w-3.5" />
                {activeEndpointLabel(rpcHealth.traffic.activeEndpointType)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Current endpoint" value={rpcHealth.traffic.currentActiveEndpoint ?? "n/a"} />
              <Metric label="Last used" value={formatDateTime(rpcHealth.traffic.lastUsedAt)} />
              <Metric label="Last switched" value={formatDateTime(rpcHealth.traffic.lastFailoverAt)} />
              <Metric label="Last failover reason" value={rpcHealth.traffic.lastFailoverReason ?? "n/a"} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Active disruptions</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${rpcHealth.activeIncidents.length > 0 ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
                <Signal className="h-3.5 w-3.5" />
                {rpcHealth.activeIncidents.length} active
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F17]">
              {rpcHealth.activeIncidents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No active disruptions.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {rpcHealth.activeIncidents.map((incident) => (
                    <div key={incident.id} className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{incident.title}</p>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${incidentSeverityTone(incident.severity)}`}>{incident.severity}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{incident.summary}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Started {formatDateTime(incident.startedAt)} · ongoing {formatDuration(incident.startedAt, new Date())}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Incident timeline</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                <Clock3 className="h-3.5 w-3.5" />
                {rpcHealth.incidentTimeline.length} events
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F17]">
              {rpcHealth.incidentTimeline.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No incident events yet.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {rpcHealth.incidentTimeline.map((event) => (
                    <div key={event.id} className="flex flex-col gap-1 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${incidentSeverityTone(event.incidentSeverity)}`}>{event.incidentSeverity}</span>
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                          {event.eventType}
                        </span>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{event.incidentTitle}</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{event.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(event.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Resolved disruptions</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Clock3 className="h-3.5 w-3.5" />
                {rpcHealth.resolvedIncidents.length} resolved
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F17]">
              {rpcHealth.resolvedIncidents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No resolved disruptions yet.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {rpcHealth.resolvedIncidents.map((incident) => (
                    <div key={incident.id} className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{incident.title}</p>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${incidentSeverityTone(incident.severity)}`}>{incident.severity}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{incident.summary}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Resolved {formatDateTime(incident.resolvedAt)} · duration{" "}
                        {incident.resolvedAt ? formatDuration(incident.startedAt, incident.resolvedAt) : "n/a"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recent failovers</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <Clock3 className="h-3.5 w-3.5" />
                {rpcHealth.traffic.recentFailovers.length} events
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F17]">
              {rpcHealth.traffic.recentFailovers.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No failovers recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {rpcHealth.traffic.recentFailovers.map((event) => (
                    <div key={event.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{event.operation}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {event.fromEndpointMasked} {"->"} {event.toEndpointMasked}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Reason: {event.reason}</p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(event.usedAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recent incidents</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                <Clock3 className="h-3.5 w-3.5" />
                {rpcHealth.recentIncidents.length} latest non-healthy
              </span>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F17]">
              {rpcHealth.recentIncidents.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No incidents recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {rpcHealth.recentIncidents.map((incident) => (
                    <div key={incident.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                          {endpointLabel(incident.endpointType)} · {incident.status}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {incident.endpointUrlMasked} · latency {formatLatency(incident.latencyMs)} · {formatDateTime(incident.checkedAt)}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getRpcStatusTone(incident.status)}`}>
                        {incident.errorType ?? "NO_ERROR_CODE"}
                      </span>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0B0F17]">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function WindowCard({
  label,
  checks,
  down,
  degraded,
  rateLimited,
}: {
  label: string;
  checks: number;
  down: number;
  degraded: number;
  rateLimited: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0B0F17]">
      <p className="text-xs font-semibold text-slate-950 dark:text-white">{label}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {checks} checks · {down} down · {degraded} degraded · {rateLimited} rate-limited
      </p>
    </div>
  );
}
