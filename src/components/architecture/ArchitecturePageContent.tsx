"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TrackingLink from "@/components/landing/TrackingLink";
import ScrollToSectionButton from "@/components/landing/ScrollToSectionButton";
import ArchitectureAnalytics from "@/components/architecture/ArchitectureAnalytics";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Code2,
  Database,
  FileCheck,
  KeyRound,
  Layers3,
  Link as LinkIcon,
  Lock,
  Network,
  Radio,
  Server,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";

const ARCHITECTURE_METRICS = [
  { value: "0.3%", label: "Platform routing fee" },
  { value: "<2s", label: "Median confirmation path" },
  { value: "100%", label: "Merchant wallet settlement" },
  { value: "HMAC", label: "Signed webhook delivery" },
];

const BUSINESS_RISKS = [
  "Custodial fund exposure from pooled processors",
  "Limited traceability across checkout and settlement",
  "Weak event authenticity in backend payment sync",
];

const ARCHITECTURE_GAINS = [
  "Wallet-direct settlement keeps merchant custody boundaries clear",
  "Shared flow for payment links and API checkout reduces integration drift",
  "Signed webhooks and transaction records support auditable operations",
];

const FLOW_STEPS = [
  {
    icon: LinkIcon,
    title: "Payment intent",
    desc: "Checkout links and API requests create a controlled payment session with amount, description, and merchant wallet context.",
  },
  {
    icon: Wallet,
    title: "Wallet authorization",
    desc: "The payer approves the transaction from a Solana-compatible wallet. Trezalink never receives private keys.",
  },
  {
    icon: Network,
    title: "On-chain settlement",
    desc: "SOL moves directly across Solana with the platform fee separated by the payment route.",
  },
  {
    icon: Radio,
    title: "Webhook sync",
    desc: "Final payment state is reflected to the merchant dashboard and delivered to the configured webhook endpoint.",
  },
];

const CONTROL_LAYERS = [
  {
    icon: Lock,
    title: "Non-custodial fund path",
    desc: "Merchant balances are not pooled inside Trezalink. Funds settle to the wallet configured in merchant settings.",
  },
  {
    icon: KeyRound,
    title: "Scoped credentials",
    desc: "API keys are regenerated from the merchant console and used to create checkout sessions programmatically.",
  },
  {
    icon: FileCheck,
    title: "Verifiable events",
    desc: "Webhook payloads are signed so your backend can validate that status updates came from Trezalink.",
  },
  {
    icon: Activity,
    title: "Operational visibility",
    desc: "Dashboard analytics, payment links, transaction tables, and webhook logs keep finance and engineering aligned.",
  },
];

const PRODUCT_SURFACES = [
  "Merchant onboarding and wallet setup",
  "Payment link builder with hosted checkout",
  "REST checkout endpoint for integrations",
  "Dashboard analytics and transaction history",
  "Webhook logs for delivery inspection",
  "Admin revenue and merchant oversight",
];

const SYSTEM_LAYERS = [
  { label: "Experience", value: "Dashboard, hosted checkout, payment links" },
  { label: "Application", value: "Next.js routes, auth, merchant APIs" },
  { label: "Integration", value: "API keys, checkout endpoint, webhooks" },
  { label: "Settlement", value: "Solana wallet-to-wallet transactions" },
  { label: "Records", value: "Transactions, revenue, logs, merchant settings" },
];

const DATA_TRAIL = [
  { icon: Database, label: "Transaction records", desc: "Checkout, settlement, fee, and order context stay queryable." },
  { icon: ShieldCheck, label: "Signed status events", desc: "Webhook delivery gives backends a verifiable payment state." },
  { icon: Zap, label: "Real-time dashboards", desc: "Finance and support can inspect payment movement without engineering handoffs." },
];

export default function ArchitecturePageContent() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-400/25">
      <PageBackground />
      <ArchitectureAnalytics />

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section
          id="architecture-hero"
          data-track-section="architecture-hero"
          className="landing-section relative flex min-h-screen items-center pb-16 pt-28"
        >
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr]">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="landing-pill mb-6 inline-flex items-center gap-2">
                  <Layers3 className="h-3.5 w-3.5" />
                  Trezalink architecture
                </span>
                <h1 className="landing-display text-4xl leading-[1.04] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                  Architecture for wallet-direct Solana payments.
                </h1>
                <p className="landing-body mx-auto mt-6 max-w-2xl text-lg md:text-xl lg:mx-0">
                  Trezalink coordinates hosted checkout, payment links, API credentials,
                  webhook delivery, and Solana settlement without taking custody of merchant funds.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {["Non-custodial", "0.3% routing fee", "Signed webhooks", "API checkout"].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-800 dark:text-cyan-200"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <TrackingLink
                    href="/register"
                    eventName="cta_click"
                    eventData={{ placement: "architecture_hero_primary" }}
                    className="landing-btn-primary"
                  >
                    Create merchant account
                    <ArrowRight className="h-4 w-4" />
                  </TrackingLink>
                  <ScrollToSectionButton
                    targetId="execution-flow"
                    eventName="cta_click"
                    eventData={{ placement: "architecture_hero_secondary_flow" }}
                    className="landing-btn-secondary"
                  >
                    See architecture flow
                    <ArrowUpRight className="h-4 w-4" />
                  </ScrollToSectionButton>
                </div>
                <TrackingLink
                  href="/developer"
                  eventName="cta_click"
                  eventData={{ placement: "architecture_hero_supporting_api" }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-cyan-700 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  Explore API
                  <ArrowUpRight className="h-4 w-4" />
                </TrackingLink>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right">
                <div className="landing-showcase relative overflow-hidden rounded-[2rem] p-6 md:p-8">
                  <div className="absolute right-6 top-6 h-28 w-28 rounded-full bg-cyan-300/20 blur-3xl" />
                  <div className="absolute bottom-8 left-8 h-32 w-32 rounded-full bg-blue-300/20 blur-3xl" />

                  <div className="relative flex items-center justify-between border-b border-blue-400/15 pb-5">
                    <div>
                      <p className="landing-label">System route map</p>
                      <h2 className="mt-2 text-xl font-semibold landing-heading">Checkout to settlement</h2>
                    </div>
                    <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-3 text-blue-700 dark:text-cyan-300">
                      <Server className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative mt-7 space-y-3">
                    {SYSTEM_LAYERS.map((layer, index) => (
                      <div key={layer.label} className="group relative grid grid-cols-[2.5rem_1fr] gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/20 bg-white/70 text-xs font-bold text-blue-800 shadow-sm dark:bg-white/[0.06] dark:text-cyan-200">
                            {index + 1}
                          </div>
                          {index < SYSTEM_LAYERS.length - 1 ? (
                            <div className="my-1 h-full min-h-8 w-px bg-gradient-to-b from-blue-400/40 to-cyan-400/20" />
                          ) : null}
                        </div>
                        <div className="rounded-2xl border border-blue-400/10 bg-white/55 p-4 transition group-hover:border-blue-400/30 dark:bg-white/[0.045]">
                          <p className="text-sm font-semibold landing-heading">{layer.label}</p>
                          <p className="mt-1 text-sm landing-body">{layer.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
              {ARCHITECTURE_METRICS.map((metric, index) => (
                <ScrollReveal key={metric.label} delay={index * 70} className="landing-card h-full rounded-2xl px-5 py-4">
                  <p className="text-2xl font-bold landing-heading md:text-3xl">{metric.value}</p>
                  <p className="mt-1 text-xs font-medium landing-subtle">{metric.label}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="risk-solution" className="landing-section relative py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mb-12 max-w-3xl">
              <span className="landing-label">Why this architecture</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight landing-heading md:text-4xl">
                Reduce payment risk without slowing your team
              </h2>
              <p className="mt-4 landing-body">
                The architecture keeps checkout, custody, settlement, and automation boundaries explicit
                so teams can move fast without hiding operational risk inside a black box.
              </p>
            </ScrollReveal>

            <div className="grid gap-6 lg:grid-cols-2">
              <ScrollReveal className="landing-card rounded-[1.75rem] p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-amber-700 dark:text-amber-300">
                    <Lock className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold landing-heading">Common platform risks</p>
                </div>
                <ul className="space-y-3">
                  {BUSINESS_RISKS.map((risk) => (
                    <li key={risk} className="flex items-start gap-3 text-sm landing-body">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>

              <ScrollReveal delay={80} className="landing-card rounded-[1.75rem] p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-3 text-blue-700 dark:text-cyan-300">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold landing-heading">How Trezalink responds</p>
                </div>
                <ul className="space-y-3">
                  {ARCHITECTURE_GAINS.map((gain) => (
                    <li key={gain} className="flex items-start gap-3 text-sm landing-body">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      {gain}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section id="execution-flow" data-track-section="execution-flow" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mb-14 max-w-2xl">
              <span className="landing-label">Execution flow</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight landing-heading md:text-4xl">
                One route for no-code links and API checkout
              </h2>
              <p className="mt-4 landing-body">
                The same architecture supports a merchant creating a payment link from the dashboard
                or an application creating checkout sessions through the REST endpoint.
              </p>
            </ScrollReveal>

            <div className="landing-showcase rounded-[2rem] p-5 md:p-8 lg:p-10">
              <div className="grid gap-4 md:grid-cols-4">
                {FLOW_STEPS.map((step, index) => (
                  <ScrollReveal key={step.title} delay={index * 90} className="relative">
                    <div className="landing-card h-full rounded-2xl p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-3 text-blue-700 dark:text-cyan-300">
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
                          0{index + 1}
                        </span>
                      </div>
                      <h3 className="mb-2 font-semibold landing-heading">{step.title}</h3>
                      <p className="text-sm landing-body">{step.desc}</p>
                    </div>
                    {index < FLOW_STEPS.length - 1 ? (
                      <ArrowRight className="absolute -right-5 top-1/2 hidden h-5 w-5 text-emerald-400/60 md:block" />
                    ) : null}
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section data-track-section="control-plane" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              <ScrollReveal variant="left">
                <span className="landing-label">Control plane</span>
                <h2 className="mb-5 mt-3 text-3xl font-bold tracking-tight landing-heading md:text-4xl">
                  Security boundaries match how the app is used
                </h2>
                <p className="mb-8 landing-body">
                  Trezalink separates merchant configuration, payment execution, event delivery,
                  and reporting so each product surface has a clear operational responsibility.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CONTROL_LAYERS.map((item) => (
                    <div key={item.title} className="landing-card rounded-2xl p-5">
                      <item.icon className="mb-4 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="mb-2 text-sm font-semibold landing-heading">{item.title}</h3>
                      <p className="text-xs landing-body">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-showcase rounded-[2rem] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="landing-label">Shared responsibility</p>
                    <h3 className="mt-2 text-lg font-semibold landing-heading">Product surfaces covered</h3>
                  </div>
                  <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-4">
                  {PRODUCT_SURFACES.map((surface) => (
                    <div key={surface} className="flex items-center gap-3 border-b border-blue-400/10 pb-4 last:border-0 last:pb-0">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm landing-body">{surface}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="data-path" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <ScrollReveal variant="left" className="landing-showcase rounded-[2rem] p-8 md:p-10">
                <div className="mb-8 flex items-center gap-3">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-700 dark:text-cyan-300">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider landing-subtle">Integration contract</p>
                    <h3 className="text-lg font-semibold landing-heading">API and webhook loop</h3>
                  </div>
                </div>
                <pre className="overflow-x-auto rounded-2xl border border-blue-400/15 bg-[#080b1f] p-4 font-mono text-xs leading-relaxed text-emerald-100 shadow-inner">
{`POST /api/v1/checkout
Authorization: Bearer <API_KEY>

{
  "amount": 10,
  "currency": "SOL",
  "orderId": "inv-1042"
}`}
                </pre>
              </ScrollReveal>

              <ScrollReveal variant="right">
                <span className="landing-label">Data path</span>
                <h2 className="mb-5 mt-3 text-3xl font-bold tracking-tight landing-heading md:text-4xl">
                  Every payment creates an auditable trail
                </h2>
                <p className="mb-8 landing-body">
                  Checkout creation, wallet confirmation, transaction state, platform fee, and webhook
                  delivery are visible through the merchant dashboard and supporting admin views.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {DATA_TRAIL.map((item) => (
                    <div key={item.label} className="landing-card rounded-2xl p-5">
                      <item.icon className="mb-4 h-5 w-5 text-cyan-700 dark:text-cyan-300" />
                      <p className="text-sm font-semibold landing-heading">{item.label}</p>
                      <p className="mt-2 text-xs landing-body">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="final-cta" className="landing-section relative py-24">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <ScrollReveal variant="scale" className="landing-final px-8 py-16 md:px-16">
              <span className="landing-label">Build on it</span>
              <h2 className="mb-5 mt-4 text-3xl font-bold tracking-tight landing-heading md:text-5xl">
                Architecture ready for merchants and developers
              </h2>
              <p className="landing-body mx-auto mb-10 max-w-xl text-lg">
                Start with payment links, then graduate to API checkout and webhook automation when your
                workflow needs deeper integration.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "architecture_final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Open merchant account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink
                  href="/docs"
                  eventName="cta_click"
                  eventData={{ placement: "architecture_final_secondary_docs" }}
                  className="landing-btn-secondary px-10 py-4"
                >
                  Read docs
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
          eventData={{ placement: "architecture_mobile_sticky" }}
          className="landing-btn-primary w-full shadow-lg shadow-blue-900/20"
        >
          <BadgeCheck className="h-4 w-4" />
          Create Merchant Account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t landing-border bg-[#f4f7ff] dark:bg-[#060818]">
        <Footer />
      </footer>
    </div>
  );
}
