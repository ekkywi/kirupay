import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TrackingLink from "@/components/landing/TrackingLink";
import AutoRefresh from "@/components/admin/AutoRefresh";
import StatusAnalytics from "@/components/status/StatusAnalytics";
import { getPublicStatusSummary, type PublicComponentStatus, type PublicIncident, type PublicSystemStatus } from "@/lib/public-status";
import { ArrowRight, BadgeCheck, Clock3, FileText, RadioTower, RefreshCw, Server, ShieldCheck, Waves, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Status",
  description:
    "Public operational status for Trezalink Solana payment infrastructure, including checkout, webhook delivery, Dashboard/API health, maintenance state, and recent incidents.",
};

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
  if (status === "OPERATIONAL") return "bg-emerald-50 text-blue-700 dark:bg-emerald-500/10 dark:text-cyan-300";
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
  const showSignupNudge = summary.systemStatus === "OPERATIONAL" && !summary.maintenance.enabled;

  const readiness = [
    {
      icon: RefreshCw,
      title: "Auto-refresh cadence",
      copy: "This public page refreshes every 45 seconds so teams can re-check current operational state.",
    },
    {
      icon: Wrench,
      title: "Maintenance pause",
      copy: "When maintenance is enabled, payment availability messaging stays visible near the top of the page.",
    },
    {
      icon: RadioTower,
      title: "Incident window",
      copy: "Active and recently resolved RPC-derived incidents are surfaced from the operational incident feed.",
    },
    {
      icon: FileText,
      title: "Operational references",
      copy: "Docs and security references help teams align implementation boundaries and incident response expectations.",
    },
  ];

  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-400/25">
      <AutoRefresh intervalMs={45000} />
      <PageBackground />
      <StatusAnalytics />

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section data-track-section="status-hero" className="landing-section relative pt-28 pb-16 md:pt-36">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 lg:grid-cols-[0.92fr_1.08fr]">
            <ScrollReveal immediate className="text-center lg:text-left">
              <span className="landing-pill mb-6 inline-flex items-center gap-2">
                <RadioTower className="h-3.5 w-3.5" />
                Public system status
              </span>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.065em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[5rem] dark:text-white">
                Operational visibility for Trezalink payments.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl lg:mx-0 dark:text-slate-300">
                Monitor checkout, webhook delivery, Dashboard/API availability, maintenance windows,
                and incident history for Trezalink Solana payment infrastructure.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${statusTone(summary.systemStatus)}`}>
                  <BadgeCheck className="h-4 w-4" />
                  {statusLabel(summary.systemStatus)}
                </span>
                <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-black text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  Updated {formatDateTime(summary.lastUpdated)}
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal immediate delay={120} variant="right" className="landing-showcase rounded-[2rem] p-5 sm:p-6">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/76 shadow-2xl shadow-slate-900/8 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/30">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
                  <div>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-blue-700 dark:text-cyan-300">Status command center</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Auto-refreshes every 45s</p>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-black ${statusTone(summary.systemStatus)}`}>
                    {statusLabel(summary.systemStatus)}
                  </span>
                </div>

                {summary.maintenance.enabled && (
                  <div className="m-5 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    <p className="font-black">Payments are temporarily paused for maintenance.</p>
                    <p className="mt-1">{summary.maintenance.message}</p>
                    <p className="mt-1 text-xs">ETA: {formatDateTime(summary.maintenance.maintenanceEndsAt)}</p>
                  </div>
                )}

                <div className="grid gap-3 p-5 sm:grid-cols-2">
                  {[
                    ["System status", statusLabel(summary.systemStatus)],
                    ["Active incidents", summary.activeIncidents.length.toString()],
                    ["Resolved window", `${summary.resolvedIncidents.length} entries`],
                    ["Auto refresh", "Every 45s"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                      <p className="mt-2 text-lg font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="component-health" className="landing-section relative py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mb-12 max-w-3xl">
              <span className="landing-label">Affected components</span>
              <h2 className="landing-display mt-3">Live component health.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                Component states are derived from maintenance state and current operational incidents.
              </p>
            </ScrollReveal>
            <div className="grid gap-4 md:grid-cols-3">
              {summary.affectedComponents.map((component, index) => {
                const Icon = componentIcon(component.name);
                return (
                  <ScrollReveal key={component.name} delay={index * 70} className="landing-card group h-full rounded-[1.7rem] p-6">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition-transform group-hover:-translate-y-1 dark:bg-blue-400/10 dark:text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusTone(component.status)}`}>
                        {statusLabel(component.status)}
                      </span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{component.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{component.message}</p>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section data-track-section="incidents" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ScrollReveal className="landing-showcase rounded-[2rem] p-5 sm:p-6">
                <div className="rounded-[1.5rem] border border-white/70 bg-white/76 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/62">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="landing-label">Live incidents</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Active incidents</h2>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${summary.activeIncidents.length > 0 ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-emerald-50 text-blue-700 dark:bg-emerald-500/10 dark:text-cyan-300"}`}>
                      {summary.activeIncidents.length} active
                    </span>
                  </div>
                  {summary.activeIncidents.length === 0 ? (
                    <div className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">No active incidents at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {summary.activeIncidents.map((incident) => (
                        <div key={incident.id} className="rounded-[1.25rem] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${incidentImpactTone(incident.impact)}`}>{statusLabel(incident.impact)}</span>
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-700 dark:bg-white/10 dark:text-slate-300">
                              {incident.phase}
                            </span>
                          </div>
                          <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">{incident.title}</p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Started {formatDateTime(incident.startedAt)} · ongoing {formatDuration(incident.startedAt, new Date())}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120} variant="right" className="landing-showcase rounded-[2rem] p-5 sm:p-6">
                <div className="rounded-[1.5rem] border border-white/70 bg-white/76 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/62">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="landing-label">Recent history</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Resolved incidents</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-slate-300">
                      {summary.resolvedIncidents.length} entries
                    </span>
                  </div>
                  {summary.resolvedIncidents.length === 0 ? (
                    <div className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">No resolved incidents in the recent window.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {summary.resolvedIncidents.map((incident) => (
                        <div key={incident.id} className="rounded-[1.25rem] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-blue-700 dark:bg-emerald-500/10 dark:text-cyan-300">Resolved</span>
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-700 dark:bg-white/10 dark:text-slate-300">{incident.phase}</span>
                          </div>
                          <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">{incident.title}</p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Resolved {formatDateTime(incident.resolvedAt)} · duration {incident.resolvedAt ? formatDuration(incident.startedAt, incident.resolvedAt) : "n/a"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="status-readiness" className="landing-section relative py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mx-auto mb-12 max-w-3xl text-center">
              <span className="landing-label">Operational notes</span>
              <h2 className="landing-display mt-3">What this page is designed to clarify.</h2>
            </ScrollReveal>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {readiness.map((item, index) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={index * 55} className="landing-card h-full rounded-[1.7rem] p-6">
                    <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.copy}</p>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section data-track-section="status-cta" className="landing-section relative py-24 pb-32 md:pb-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <ScrollReveal variant="scale" className="landing-final rounded-[2.4rem] px-6 py-16 sm:px-10 md:py-20">
              <span className="landing-pill inline-flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5" />
                Operational references
              </span>
              <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
                Need implementation context during an incident?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Use docs and security references to align your team on incident handling,
                monitoring expectations, and implementation boundaries.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <TrackingLink
                  href="/docs"
                  eventName="cta_click"
                  eventData={{ placement: "status_final_primary_docs" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  View docs
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink
                  href="/security"
                  eventName="cta_click"
                  eventData={{ placement: "status_final_secondary_security" }}
                  className="landing-btn-secondary px-10 py-4"
                >
                  Security overview
                </TrackingLink>
              </div>
              {showSignupNudge && (
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "status_final_signup_nudge" }}
                  className="mt-7 inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  System is operational. Create merchant account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
              )}
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200/70 bg-[#f4f7ff] dark:border-white/10 dark:bg-[#060818]">
        <Footer />
      </footer>
    </div>
  );
}
