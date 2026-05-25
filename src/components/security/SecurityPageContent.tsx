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
  Fingerprint,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  Wallet,
  Webhook,
} from "lucide-react";

const WHO_FOR = [
  "Global SMB merchants",
  "Non-custodial settlement",
  "No setup fee",
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
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <SecurityAnalytics />

      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>

      <main>
        <section data-track-section="security-hero" className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-[1fr_0.9fr] gap-12 items-center">
            <ScrollReveal immediate className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                <ShieldCheck className="w-3.5 h-3.5" /> Security
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                <span className="gradient-text">Secure global payments</span>
                <br />
                <span className="landing-heading">without adding custody risk</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                Launch with clear security boundaries: payer authorization in wallet flow,
                merchant-direct settlement, and signed backend events.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
                {WHO_FOR.map((item) => (
                  <span key={item} className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-white/85 dark:bg-white/[0.05] border landing-border landing-muted">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "security_hero_primary" }}
                  className="landing-btn-primary"
                >
                  Create Merchant Account
                  <ArrowRight className="w-4 h-4" />
                </TrackingLink>
                <ScrollToSectionButton
                  targetId="security-snapshot"
                  eventName="cta_click"
                  eventData={{ placement: "security_hero_secondary_snapshot" }}
                  className="landing-btn-secondary"
                >
                  See Security Snapshot
                  <ArrowUpRight className="w-4 h-4" />
                </ScrollToSectionButton>
              </div>
            </ScrollReveal>

            <ScrollReveal immediate delay={120} variant="right" className="landing-panel rounded-2xl p-8">
              <p className="text-xs landing-subtle uppercase tracking-wider font-semibold mb-5">Current controls only</p>
              {[
                "Private keys remain with merchant wallets",
                "API credentials can be rotated from dashboard",
                "Webhook events support signature validation",
                "Duplicate order IDs are blocked per merchant",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 border-b landing-border py-4 first:pt-0 last:border-0 last:pb-0">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm landing-body">{item}</span>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>

        <section id="security-snapshot" data-track-section="security-snapshot" className="landing-section relative py-24">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-3xl mb-14">
              <span className="landing-label">Security snapshot</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">Protection you can scan in five seconds</h2>
              <p className="mt-4 landing-body">These are active platform controls available in current product flows.</p>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SECURITY_SNAPSHOT.map((item, index) => (
                <ScrollReveal key={item.label} delay={index * 70} className="landing-panel rounded-2xl p-6 h-full">
                  <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-6" />
                  <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">{item.label}</p>
                  <h3 className="mt-2 font-semibold landing-heading">{item.value}</h3>
                  <p className="mt-2 text-sm landing-body">{item.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="objections" className="landing-section relative py-24 bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal variant="left">
              <span className="landing-label">Why safer than custodial processors</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">Control stays with merchant teams</h2>
              <div className="space-y-3">
                {TRUST_POINTS.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-xl border landing-border bg-white/70 dark:bg-white/[0.03] p-4">
                    <Shield className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-sm landing-body">{point}</p>
                  </div>
                ))}
              </div>
              <TrackingLink
                href="/register"
                eventName="cta_click"
                eventData={{ placement: "security_middle_primary" }}
                className="inline-flex items-center gap-1.5 mt-7 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Start secure onboarding
                <ArrowUpRight className="w-4 h-4" />
              </TrackingLink>
            </ScrollReveal>

            <ScrollReveal variant="right" className="landing-panel rounded-2xl p-8">
              <span className="landing-label">Shared responsibility</span>
              <h3 className="mt-3 text-2xl font-semibold landing-heading">Clear ownership for each secret</h3>
              <div className="mt-6 space-y-4">
                {SHARED_RESPONSIBILITY.map((row) => (
                  <div key={row.label} className="border-b landing-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <row.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="font-semibold landing-heading">{row.label}</p>
                    </div>
                    <p className="text-sm landing-body"><span className="font-semibold">Merchant:</span> {row.merchant}</p>
                    <p className="text-sm landing-body mt-1"><span className="font-semibold">Trezalink:</span> {row.trezalink}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="security-faq" className="landing-section relative py-20">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal className="text-center mb-10">
              <span className="landing-label">Security FAQ</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">Answers before go-live</h2>
            </ScrollReveal>
            <div className="space-y-3">
              {FAQS.map((item, idx) => (
                <ScrollReveal key={item.key} delay={idx * 45}>
                  <details data-faq-item={item.key} className="landing-panel rounded-xl p-5 group">
                    <summary className="list-none cursor-pointer flex items-start justify-between gap-4">
                      <span className="font-semibold landing-heading text-left">{item.q}</span>
                      <Clock3 className="w-4 h-4 landing-subtle shrink-0 mt-1 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="mt-3 text-sm landing-body">{item.a}</p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="final-cta" className="landing-section relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16 md:px-16 md:py-20 border-blue-200/50 dark:border-blue-500/20">
              <span className="landing-label">Launch securely</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">Launch securely in minutes</h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">
                Start accepting global payments with security boundaries designed for merchant control.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "security_final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Create Merchant Account
                  <ArrowRight className="w-4 h-4" />
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
          className="landing-btn-primary w-full shadow-lg shadow-blue-900/20"
        >
          <BadgeCheck className="w-4 h-4" />
          Create Merchant Account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
