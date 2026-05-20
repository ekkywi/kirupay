import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import AutoRefresh from "@/components/admin/AutoRefresh";
import { getPublicStatusSummary, type PublicComponentStatus, type PublicIncident, type PublicSystemStatus } from "@/lib/public-status";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, Server, ShieldCheck, Waves } from "lucide-react";

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "n/a";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function formatDuration(from: Date, to: Date) {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins === 0 ? `${hours}h` : `${hours}h ${remMins}m`;
}

function statusTone(status: PublicSystemStatus) {
  if (status === "OPERATIONAL") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (status === "DEGRADED") return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  if (status === "PARTIAL_OUTAGE") return "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300";
  return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
}

function statusLabel(status: PublicSystemStatus) {
  if (status === "OPERATIONAL") return "Operational";
  if (status === "DEGRADED") return "Degraded";
  if (status === "PARTIAL_OUTAGE") return "Partial Outage";
  return "Major Outage";
}

function componentIcon(name: PublicComponentStatus["name"]) {
  if (name === "Checkout") return Waves;
  if (name === "Webhook delivery") return Server;
  return ShieldCheck;
}

function incidentImpactTone(impact: PublicIncident["impact"]) {
  return statusTone(impact === "OPERATIONAL" ? "DEGRADED" : impact);
}

export default async function StatusPage() {
  const summary = await getPublicStatusSummary();

  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <AutoRefresh intervalMs={45000} />
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>
      <main>
        <section className="landing-section relative pt-28 pb-10">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal immediate className="landing-panel rounded-3xl p-7 md:p-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Public system status</p>
                  <h1 className="mt-2 text-3xl md:text-4xl font-bold landing-heading">Current operational status</h1>
                  <p className="mt-2 text-sm landing-body">Last updated {formatDateTime(summary.lastUpdated)}.</p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${statusTone(summary.systemStatus)}`}>
                  <BadgeCheck className="w-4 h-4" />
                  {statusLabel(summary.systemStatus)}
                </span>
              </div>

              {summary.maintenance.enabled && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <p className="font-semibold">Payments are temporarily paused for maintenance.</p>
                  <p className="mt-1">{summary.maintenance.message}</p>
                  <p className="mt-1 text-xs">ETA: {formatDateTime(summary.maintenance.maintenanceEndsAt)}</p>
                </div>
              )}
            </ScrollReveal>
          </div>
        </section>

        <section className="landing-section relative py-12 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-8">
              <span className="landing-label">Affected components</span>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight landing-heading">Live component health</h2>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-4">
              {summary.affectedComponents.map((component, index) => {
                const Icon = componentIcon(component.name);
                return (
                  <ScrollReveal key={component.name} delay={index * 70} className="landing-panel rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${statusTone(component.status)}`}>
                        {statusLabel(component.status)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold landing-heading">{component.name}</h3>
                    <p className="mt-2 text-sm landing-body">{component.message}</p>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-12 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ScrollReveal className="landing-panel rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold landing-heading">Active incidents</h2>
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${summary.activeIncidents.length > 0 ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
                    {summary.activeIncidents.length} active
                  </span>
                </div>
                {summary.activeIncidents.length === 0 ? (
                  <p className="text-sm landing-body">No active incidents at the moment.</p>
                ) : (
                  <div className="space-y-3">
                    {summary.activeIncidents.map((incident) => (
                      <div key={incident.id} className="rounded-xl border landing-border bg-white/70 dark:bg-white/[0.02] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${incidentImpactTone(incident.impact)}`}>{statusLabel(incident.impact)}</span>
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                            {incident.phase}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold landing-heading">{incident.title}</p>
                        <p className="mt-1 text-xs landing-subtle">Started {formatDateTime(incident.startedAt)} · ongoing {formatDuration(incident.startedAt, new Date())}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollReveal>

              <ScrollReveal delay={120} className="landing-panel rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold landing-heading">Recent resolved incidents</h2>
                  <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300">
                    {summary.resolvedIncidents.length} entries
                  </span>
                </div>
                {summary.resolvedIncidents.length === 0 ? (
                  <p className="text-sm landing-body">No resolved incidents in the recent window.</p>
                ) : (
                  <div className="space-y-3">
                    {summary.resolvedIncidents.map((incident) => (
                      <div key={incident.id} className="rounded-xl border landing-border bg-white/70 dark:bg-white/[0.02] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Resolved</span>
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">{incident.phase}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold landing-heading">{incident.title}</p>
                        <p className="mt-1 text-xs landing-subtle">
                          Resolved {formatDateTime(incident.resolvedAt)} · duration {incident.resolvedAt ? formatDuration(incident.startedAt, incident.resolvedAt) : "n/a"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-20 border-t landing-border">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-14">
              <AlertTriangle className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400" />
              <h2 className="mt-4 text-3xl font-bold tracking-tight landing-heading">Need implementation details?</h2>
              <p className="mt-3 landing-body">Engineering-level details, diagnostics, and recovery controls are available in the admin maintenance console.</p>
              <div className="mt-7 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/roadmap" className="landing-btn-primary">View roadmap <ArrowRight className="w-4 h-4" /></Link>
                <Link href="/docs" className="landing-btn-secondary">Read docs</Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
