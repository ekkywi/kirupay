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

export default function ArchitecturePageContent() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <ArchitectureAnalytics />

      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section data-track-section="architecture-hero" className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                  <Layers3 className="w-3.5 h-3.5" />
                  Trezalink architecture
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                  <span className="gradient-text">Architecture that protects control</span>
                  <br />
                  <span className="landing-heading">while keeping payment execution fast</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                  Trezalink coordinates hosted checkout, payment links, API credentials,
                  webhook delivery, and Solana settlement without taking custody of merchant funds.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <TrackingLink
                    href="/register"
                    eventName="cta_click"
                    eventData={{ placement: "architecture_hero_primary" }}
                    className="landing-btn-primary"
                  >
                    Create merchant account
                    <ArrowRight className="w-4 h-4" />
                  </TrackingLink>
                  <ScrollToSectionButton
                    targetId="execution-flow"
                    eventName="cta_click"
                    eventData={{ placement: "architecture_hero_secondary_flow" }}
                    className="landing-btn-secondary"
                  >
                    See architecture flow
                    <ArrowUpRight className="w-4 h-4" />
                  </ScrollToSectionButton>
                </div>
                <TrackingLink
                  href="/developer"
                  eventName="cta_click"
                  eventData={{ placement: "architecture_hero_supporting_api" }}
                  className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Explore API
                  <ArrowUpRight className="w-4 h-4" />
                </TrackingLink>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right">
                <div className="landing-panel rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between border-b landing-border pb-5 mb-6">
                    <div>
                      <p className="text-xs font-semibold landing-subtle uppercase tracking-wider">System route</p>
                      <h2 className="mt-1 text-xl font-semibold landing-heading">Checkout to settlement</h2>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/15">
                      <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {SYSTEM_LAYERS.map((layer, index) => (
                      <div key={layer.label} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border landing-border flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                            {index + 1}
                          </div>
                          {index < SYSTEM_LAYERS.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-white/10 my-1" />}
                        </div>
                        <div className="pb-5">
                          <p className="text-sm font-semibold landing-heading">{layer.label}</p>
                          <p className="text-sm landing-body mt-0.5">{layer.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {ARCHITECTURE_METRICS.map((metric, index) => (
                <ScrollReveal key={metric.label} delay={index * 70} className="landing-panel rounded-xl px-5 py-4 h-full">
                  <p className="text-2xl md:text-3xl font-bold landing-heading">{metric.value}</p>
                  <p className="text-xs landing-subtle mt-0.5 font-medium">{metric.label}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="risk-solution" className="landing-section relative py-20">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-3xl mb-12">
              <span className="landing-label">Why this architecture</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                Reduce payment risk without slowing your team
              </h2>
            </ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-6">
              <ScrollReveal className="landing-panel rounded-2xl p-7">
                <p className="text-sm font-semibold landing-heading mb-4">Common platform risks</p>
                <ul className="space-y-3">
                  {BUSINESS_RISKS.map((risk) => (
                    <li key={risk} className="flex items-start gap-3 text-sm landing-body">
                      <Lock className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
              <ScrollReveal delay={80} className="landing-panel rounded-2xl p-7">
                <p className="text-sm font-semibold landing-heading mb-4">How Trezalink architecture responds</p>
                <ul className="space-y-3">
                  {ARCHITECTURE_GAINS.map((gain) => (
                    <li key={gain} className="flex items-start gap-3 text-sm landing-body">
                      <Check className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {gain}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section id="execution-flow" data-track-section="execution-flow" className="landing-section relative py-24">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-14">
              <span className="landing-label">Execution flow</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                One route for no-code links and API checkout
              </h2>
              <p className="mt-4 landing-body">
                The same architecture supports a merchant creating a payment link from the dashboard
                or an application creating checkout sessions through the REST endpoint.
              </p>
            </ScrollReveal>

            <div className="landing-panel rounded-2xl p-6 md:p-8 lg:p-10">
              <div className="grid md:grid-cols-4 gap-4">
                {FLOW_STEPS.map((step, index) => (
                  <ScrollReveal key={step.title} delay={index * 90} className="relative">
                    <div className="h-full rounded-xl border landing-border bg-slate-50/80 dark:bg-white/[0.03] p-5">
                      <step.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-5" />
                      <p className="text-xs font-semibold landing-subtle uppercase tracking-wider mb-2">
                        Step {index + 1}
                      </p>
                      <h3 className="font-semibold landing-heading mb-2">{step.title}</h3>
                      <p className="text-sm landing-body">{step.desc}</p>
                    </div>
                    {index < FLOW_STEPS.length - 1 && (
                      <ArrowRight className="hidden md:block absolute top-1/2 -right-5 w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section data-track-section="control-plane" className="landing-section relative py-24 bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <ScrollReveal variant="left">
                <span className="landing-label">Control plane</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Security boundaries match how the app is used
                </h2>
                <p className="landing-body mb-8">
                  Trezalink separates merchant configuration, payment execution, event delivery,
                  and reporting so each product surface has a clear operational responsibility.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CONTROL_LAYERS.map((item) => (
                    <div key={item.title} className="landing-panel rounded-xl p-5">
                      <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-4" />
                      <h3 className="text-sm font-semibold landing-heading mb-2">{item.title}</h3>
                      <p className="text-xs landing-body">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold landing-heading">Product surfaces covered</h3>
                  <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-4">
                  {PRODUCT_SURFACES.map((surface) => (
                    <div key={surface} className="flex items-center gap-3 pb-4 border-b landing-border last:border-0 last:pb-0">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-sm landing-body">{surface}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="data-path" className="landing-section relative py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
              <ScrollReveal variant="left" className="landing-panel rounded-2xl p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/15">
                    <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Integration contract</p>
                    <h3 className="text-lg font-semibold landing-heading">API and webhook loop</h3>
                  </div>
                </div>
                <pre className="text-xs font-mono landing-muted bg-slate-100 dark:bg-black/40 rounded-xl p-4 border landing-border overflow-x-auto">
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
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Every payment creates an auditable trail
                </h2>
                <p className="landing-body mb-8">
                  Checkout creation, wallet confirmation, transaction state, platform fee, and webhook
                  delivery are visible through the merchant dashboard and supporting admin views.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { icon: Database, label: "Transaction records" },
                    { icon: ShieldCheck, label: "Signed status events" },
                    { icon: Zap, label: "Real-time dashboards" },
                  ].map((item) => (
                    <div key={item.label} className="landing-panel rounded-xl p-5">
                      <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-4" />
                      <p className="text-sm font-semibold landing-heading">{item.label}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="final-cta" className="landing-section relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16 md:px-16">
              <span className="landing-label">Build on it</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">
                Architecture ready for merchants and developers
              </h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">
                Start with payment links, then graduate to API checkout and webhook automation when your
                workflow needs deeper integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "architecture_final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Open merchant account
                  <ArrowRight className="w-4 h-4" />
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
          <BadgeCheck className="w-4 h-4" />
          Create Merchant Account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]">
        <Footer />
      </footer>
    </div>
  );
}
