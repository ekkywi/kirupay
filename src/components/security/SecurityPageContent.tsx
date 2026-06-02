"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TrackingLink from "@/components/landing/TrackingLink";
import ScrollToSectionButton from "@/components/landing/ScrollToSectionButton";
import SecurityAnalytics from "@/components/security/SecurityAnalytics";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clock3,
  FileCheck,
  FileText,
  Fingerprint,
  KeyRound,
  Lock,
  RadioTower,
  Shield,
  ShieldCheck,
  Wallet,
  Webhook,
} from "lucide-react";

const WHO_FOR = [
  "Non-custodial settlement",
  "Webhook signatures",
  "API key rotation",
  "Transparent boundaries",
];

const SECURITY_SNAPSHOT = [
  {
    icon: Wallet,
    label: "Custody model",
    value: "Wallet-direct settlement",
    desc: "Merchant funds are not held by Trezalink.",
  },
  {
    icon: Webhook,
    label: "Webhook integrity",
    value: "HMAC signature support",
    desc: "Verify event origin with webhook secrets.",
  },
  {
    icon: KeyRound,
    label: "Credential hygiene",
    value: "API key rotation",
    desc: "Regenerate merchant API keys from dashboard.",
  },
  {
    icon: FileCheck,
    label: "Order safety",
    value: "Duplicate order protection",
    desc: "Reused order IDs are rejected per merchant.",
  },
];

const TRUST_POINTS = [
  "Payer authorization happens in wallet flow, not through shared platform custody.",
  "Settlement goes directly to merchant wallet after payment confirmation.",
  "Operational events can be validated via webhook signatures and logs.",
  "Security boundaries are explicit between platform controls and merchant secrets.",
];

const SHARED_RESPONSIBILITY = [
  {
    icon: Fingerprint,
    label: "API key",
    merchant: "Store securely and rotate on schedule.",
    trezalink: "Provide key regeneration in the dashboard.",
  },
  {
    icon: Lock,
    label: "Webhook secret",
    merchant: "Validate incoming signatures in backend handlers.",
    trezalink: "Sign payloads and expose delivery/webhook logs.",
  },
  {
    icon: Wallet,
    label: "Wallet key",
    merchant: "Maintain wallet custody and signing control.",
    trezalink: "Never request or store private keys.",
  },
];

const READINESS = [
  {
    icon: ShieldCheck,
    title: "Private-key boundary",
    copy: "Merchant wallet keys stay outside Trezalink systems and remain under merchant wallet control.",
  },
  {
    icon: Webhook,
    title: "Webhook verification",
    copy: "Backend events can be validated with HMAC signatures before fulfillment logic runs.",
  },
  {
    icon: KeyRound,
    title: "Credential rotation",
    copy: "Merchant API credentials can be regenerated from the dashboard when teams rotate secrets.",
  },
  {
    icon: FileCheck,
    title: "Duplicate order protection",
    copy: "Reused order IDs are blocked per merchant to reduce accidental duplicate checkout state.",
  },
  {
    icon: RadioTower,
    title: "Status visibility",
    copy: "Public status and product reporting surfaces help teams separate incidents from integration issues.",
  },
  {
    icon: FileText,
    title: "Finance-ready logs",
    copy: "Payment records, webhook logs, and fee details support reconciliation after settlement.",
  },
];

const FAQS = [
  {
    key: "private-key",
    q: "Does Trezalink ever access merchant private keys?",
    a: "No. Merchant private keys remain with the wallet provider and are never handled by Trezalink.",
  },
  {
    key: "signature-verification",
    q: "How do we verify webhook authenticity?",
    a: "Use your webhook secret to validate the X-Trezalink-Signature HMAC value on every incoming event.",
  },
  {
    key: "settlement-finality",
    q: "How is settlement finalized?",
    a: "Payments settle after on-chain confirmation and are recorded with fee and net details for reconciliation.",
  },
  {
    key: "incident-visibility",
    q: "Where can teams monitor reliability?",
    a: "Status and operational transparency are available through the public status and product reporting surfaces.",
  },
];

export default function SecurityPageContent() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-400/25">
      <PageBackground />
      <SecurityAnalytics />

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section data-track-section="security-hero" className="landing-section relative min-h-screen pt-28 pb-16 md:pt-36">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 lg:grid-cols-[0.94fr_1.06fr]">
            <ScrollReveal immediate className="text-center lg:text-left">
              <span className="landing-pill mb-6 inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Security
              </span>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.065em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[5rem] dark:text-white">
                Secure global payments without adding custody risk.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl lg:mx-0 dark:text-slate-300">
                Launch with clear security boundaries: payer authorization in wallet flow,
                merchant-direct settlement, and signed backend events your team can verify.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
                {WHO_FOR.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-black text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "security_hero_primary" }}
                  className="landing-btn-primary"
                >
                  Create Merchant Account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <ScrollToSectionButton
                  targetId="security-snapshot"
                  eventName="cta_click"
                  eventData={{ placement: "security_hero_secondary_snapshot" }}
                  className="landing-btn-secondary"
                >
                  See Security Snapshot
                  <ArrowUpRight className="h-4 w-4" />
                </ScrollToSectionButton>
              </div>
            </ScrollReveal>

            <ScrollReveal immediate delay={120} variant="right" className="landing-showcase rounded-[2rem] p-5 sm:p-6">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/76 shadow-2xl shadow-slate-900/8 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/30">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
                  <div>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-blue-700 dark:text-cyan-300">Security control console</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Current controls only</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-blue-800 dark:bg-emerald-300/10 dark:text-cyan-200">
                    Verified flow
                  </span>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-3">
                    {[
                      ["Custody", "Private keys remain with merchant wallets"],
                      ["Webhook", "HMAC signature validation supported"],
                      ["API key", "Regeneration available in dashboard"],
                      ["Orders", "Duplicate order IDs rejected per merchant"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700 dark:bg-emerald-300/10 dark:text-cyan-200">
                            <Check className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
                            <p className="mt-1 text-sm font-black leading-5 text-slate-950 dark:text-white">{value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative min-h-[350px] overflow-hidden rounded-[1.5rem] bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/22 blur-3xl dark:bg-violet-400/16" />
                    <div className="absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/14" />
                    <div className="relative flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      <span>Boundary map</span>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-200 dark:bg-emerald-100 dark:text-blue-800">No custody</span>
                    </div>
                    <div className="relative mt-8 space-y-3">
                      {[
                        ["Payer wallet", "Authorizes payment"],
                        ["Trezalink", "Creates session and signs events"],
                        ["Merchant wallet", "Receives settlement"],
                      ].map(([label, value], index) => (
                        <div key={label} className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] p-4 dark:border-slate-950/10 dark:bg-slate-950/[0.04]">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-black">{label}</p>
                              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{value}</p>
                            </div>
                            <span className={`h-3 w-3 rounded-full ${index === 1 ? "bg-cyan-300" : "bg-emerald-300"}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-5 rounded-2xl bg-emerald-300 p-4 text-slate-950">
                      <div className="flex items-center gap-2 text-sm font-black">
                        <ShieldCheck className="h-4 w-4" />
                        Platform boundary: orchestration, not custody
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section id="security-snapshot" data-track-section="security-snapshot" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mx-auto mb-14 max-w-3xl text-center">
              <span className="landing-label">Security snapshot</span>
              <h2 className="landing-display mt-3">Protection you can scan in five seconds.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                These are active platform controls available in current product flows.
              </p>
            </ScrollReveal>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {SECURITY_SNAPSHOT.map((item, index) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.label} delay={index * 70} className="landing-card group h-full rounded-[1.7rem] p-6">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition-transform group-hover:-translate-y-1 dark:bg-blue-400/10 dark:text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <h3 className="mt-3 text-lg font-black tracking-tight text-slate-950 dark:text-white">{item.value}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section data-track-section="control-boundaries" className="landing-section relative py-24">
          <div className="mx-auto grid max-w-7xl items-start gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr]">
            <ScrollReveal>
              <span className="landing-label">Control boundaries</span>
              <h2 className="landing-display mt-3">Merchant control stays explicit at every sensitive edge.</h2>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                Trezalink coordinates checkout sessions, settlement records, and signed events while
                merchant teams keep ownership of wallet custody and backend secret handling.
              </p>
              <div className="mt-8 space-y-3">
                {TRUST_POINTS.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                    <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-cyan-300" />
                    <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{point}</p>
                  </div>
                ))}
              </div>
              <TrackingLink
                href="/register"
                eventName="cta_click"
                eventData={{ placement: "security_middle_primary" }}
                className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800 dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                Start secure onboarding
                <ArrowUpRight className="h-4 w-4" />
              </TrackingLink>
            </ScrollReveal>

            <ScrollReveal variant="right" className="landing-showcase rounded-[2rem] p-5 sm:p-6">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/76 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/62">
                <span className="landing-label">Shared responsibility</span>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Clear ownership for each secret.</h3>
                <div className="mt-6 space-y-4">
                  {SHARED_RESPONSIBILITY.map((row) => {
                    const Icon = row.icon;
                    return (
                      <div key={row.label} className="rounded-[1.25rem] border border-slate-200/80 bg-white/64 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="font-black text-slate-950 dark:text-white">{row.label}</p>
                        </div>
                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400"><span className="font-black text-slate-800 dark:text-slate-200">Merchant:</span> {row.merchant}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400"><span className="font-black text-slate-800 dark:text-slate-200">Trezalink:</span> {row.trezalink}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="security-readiness" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="landing-showcase rounded-[2rem] p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
                <ScrollReveal>
                  <span className="landing-label">Operational readiness</span>
                  <h2 className="landing-display mt-3">Security controls your ops and dev teams can reason about.</h2>
                  <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                    Keep the checkout surface simple while preserving verification, credential hygiene,
                    status context, and reconciliation details around every payment flow.
                  </p>
                  <TrackingLink
                    href="/docs/security"
                    eventName="cta_click"
                    eventData={{ placement: "security_readiness_docs" }}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                  >
                    Read security docs
                    <ArrowUpRight className="h-4 w-4" />
                  </TrackingLink>
                </ScrollReveal>
                <div className="grid gap-3 sm:grid-cols-2">
                  {READINESS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <ScrollReveal key={item.title} delay={index * 45} className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-5 dark:border-white/10 dark:bg-slate-950/45">
                        <Icon className="h-5 w-5 text-emerald-600 dark:text-cyan-300" />
                        <h3 className="mt-5 text-lg font-black tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.copy}</p>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section data-track-section="security-faq" className="landing-section relative py-20">
          <div className="mx-auto max-w-4xl px-6">
            <ScrollReveal className="mb-10 text-center">
              <span className="landing-label">Security FAQ</span>
              <h2 className="landing-display mt-3">Answers before go-live.</h2>
            </ScrollReveal>
            <div className="space-y-3">
              {FAQS.map((item, index) => (
                <ScrollReveal key={item.key} delay={index * 45}>
                  <details data-faq-item={item.key} className="landing-card group rounded-[1.35rem] p-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <span className="text-left font-black text-slate-950 dark:text-white">{item.q}</span>
                      <Clock3 className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90 dark:text-slate-500" />
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.a}</p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="final-cta" className="landing-section relative py-24 pb-32 md:pb-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <ScrollReveal variant="scale" className="landing-final rounded-[2.4rem] px-6 py-16 sm:px-10 md:py-20">
              <span className="landing-pill inline-flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5" />
                Launch securely
              </span>
              <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
                Launch Solana payments with boundaries your team can explain.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Start accepting global payments with non-custodial settlement, signed events,
                and clear ownership for merchant secrets.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "security_final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Create Merchant Account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink
                  href="/docs/security"
                  eventName="cta_click"
                  eventData={{ placement: "security_final_secondary_docs" }}
                  className="landing-btn-secondary px-10 py-4"
                >
                  Read Security Docs
                </TrackingLink>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <TrackingLink
          href="/register"
          eventName="cta_click"
          eventData={{ placement: "security_mobile_sticky" }}
          className="landing-btn-primary w-full shadow-lg shadow-blue-950/20"
        >
          <BadgeCheck className="h-4 w-4" />
          Create Merchant Account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t border-slate-200/70 bg-[#f4f7ff] dark:border-white/10 dark:bg-[#060818]">
        <Footer />
      </footer>
    </div>
  );
}
