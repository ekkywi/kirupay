import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import SupportedAssets from "@/components/landing/SupportedAssets";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Zap,
  Shield,
  TrendingDown,
  ArrowUpRight,
  Link as LinkIcon,
  QrCode,
  Copy,
  Send,
  LayoutTemplate,
  Lock,
  KeyRound,
  FileCheck,
  Check,
  Code2,
  Wallet,
  Building2,
  Server,
  BadgeCheck,
  Headphones,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Home",
};

const METRICS = [
  { value: "0.3%", label: "Flat transaction fee" },
  { value: "<2s", label: "Median settlement" },
  { value: "100%", label: "Non-custodial" },
  { value: "24/7", label: "Platform availability" },
];

const TRUST_PILLARS = [
  { icon: Shield, label: "Non-custodial architecture" },
  { icon: Server, label: "Solana mainnet production" },
  { icon: FileCheck, label: "HMAC-signed webhooks" },
  { icon: BadgeCheck, label: "Transparent 0.3% pricing" },
];

const STEPS = [
  { step: "01", title: "Create payment link", desc: "Configure amount, description, and branding — no engineering required." },
  { step: "02", title: "Client settles on-chain", desc: "Payers send SOL from any Solana-compatible wallet worldwide." },
  { step: "03", title: "Atomic merchant payout", desc: "Net proceeds arrive in your wallet with verifiable on-chain receipts." },
];

const ENTERPRISE_FEATURES = [
  "Scoped API keys per environment",
  "Webhook delivery logs & retries",
  "Merchant dashboard & analytics",
  "Role-ready account structure",
];

const AUDIENCE = ["Freelancers", "Agencies", "SaaS", "Marketplaces", "Remote teams"];

export default function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />

      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        {/* HERO */}
        <section className="landing-section relative min-h-screen flex items-center pt-24 pb-16">
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-12">
              <ScrollReveal immediate delay={0} className="flex-1 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                  <Building2 className="w-3.5 h-3.5" />
                  Enterprise payment infrastructure
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                  <span className="gradient-text">Solana-native payments</span>
                  <br />
                  <span className="landing-heading">for growing businesses</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl landing-body max-w-xl mx-auto lg:mx-0">
                  Accept cross-border crypto with institutional clarity — direct wallet settlement,
                  predictable fees, and full fund control.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/register" className="landing-btn-primary">
                    Open merchant account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/docs" className="landing-btn-secondary">
                    View documentation
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="mt-6 text-sm landing-subtle flex items-center justify-center lg:justify-start gap-2">
                  <Headphones className="w-4 h-4" />
                  Self-serve onboarding · No setup fees
                </p>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right" className="flex-1 w-full max-w-[440px] mx-auto lg:mx-0">
                <div className="landing-panel rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-semibold landing-subtle uppercase tracking-wider">Settlement preview</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Confirmed
                    </span>
                  </div>
                  <div className="text-center py-6 border-b landing-border">
                    <p className="text-sm landing-subtle mb-1">Gross payment</p>
                    <p className="text-4xl font-bold tracking-tight landing-heading">
                      10<span className="text-2xl font-semibold landing-muted">.00 SOL</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between py-5 border-b landing-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/15">
                        <TrendingDown className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="text-sm landing-muted">Platform fee (0.3%)</span>
                    </div>
                    <span className="font-mono text-sm landing-heading">−0.03</span>
                  </div>
                  <div className="pt-6 text-center">
                    <p className="text-sm landing-subtle mb-1">Net to merchant wallet</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">9.97 SOL</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Trust pillars */}
            <ScrollReveal delay={80} className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {TRUST_PILLARS.map((item, i) => (
                <ScrollReveal key={item.label} delay={i * 70} variant="fade" className="flex items-center gap-3 landing-panel rounded-xl px-4 py-3 h-full">
                  <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-medium landing-muted leading-snug">{item.label}</span>
                </ScrollReveal>
              ))}
            </ScrollReveal>

            {/* Metrics */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {METRICS.map((m, i) => (
                <ScrollReveal key={m.label} delay={i * 80} className="landing-panel rounded-xl px-5 py-4 h-full">
                  <p className="text-2xl md:text-3xl font-bold landing-heading">{m.value}</p>
                  <p className="text-xs landing-subtle mt-0.5 font-medium">{m.label}</p>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={100} className="mt-12 pt-8 border-t landing-border">
              <p className="text-center text-xs landing-subtle uppercase tracking-widest mb-4">
                Built for teams operating globally
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {AUDIENCE.map((label) => (
                  <span
                    key={label}
                    className="text-sm font-medium landing-muted px-4 py-2 rounded-full border landing-border bg-white/60 dark:bg-white/[0.02]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <SupportedAssets />

        {/* HOW IT WORKS */}
        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-16">
              <span className="landing-label">How it works</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                Operational flow designed for finance teams
              </h2>
              <p className="mt-4 landing-body">
                A predictable three-step pipeline from invoice to on-chain settlement — auditable,
                automated, and wallet-direct.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <ScrollReveal key={s.step} delay={i * 100} className="landing-panel rounded-2xl p-8 relative overflow-hidden h-full">
                  <span className="text-5xl font-black text-slate-200 dark:text-white/[0.04] absolute top-4 right-6 select-none">
                    {s.step}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/15 border landing-border flex items-center justify-center mb-5 text-sm font-bold text-blue-700 dark:text-blue-400">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold landing-heading mb-2">{s.title}</h3>
                  <p className="text-sm landing-body">{s.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ENTERPRISE */}
        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal variant="left">
                <span className="landing-label">Enterprise ready</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Infrastructure your compliance team can explain
                </h2>
                <p className="landing-body mb-8">
                  Trezalink is built for merchants who need transparent fund flows, signed webhook
                  events, and production-grade API controls — without taking custody of client assets.
                </p>
                <ul className="space-y-3">
                  {ENTERPRISE_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm landing-body">
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/architecture"
                  className="inline-flex items-center gap-1.5 mt-8 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Review system architecture
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </ScrollReveal>
              <ScrollReveal variant="right" delay={80} className="landing-panel rounded-2xl p-8 md:p-10">
                <h3 className="text-lg font-semibold landing-heading mb-6">Security & control matrix</h3>
                <div className="space-y-4">
                  {[
                    { title: "Fund custody", value: "Never held by Trezalink", ok: true },
                    { title: "Settlement network", value: "Solana Mainnet", ok: true },
                    { title: "Webhook integrity", value: "HMAC-SHA256 signed", ok: true },
                    { title: "Chargeback exposure", value: "None after finality", ok: true },
                    { title: "USDC (SPL)", value: "Roadmap", ok: false },
                  ].map((row) => (
                    <div
                      key={row.title}
                      className="flex items-center justify-between py-3 border-b landing-border last:border-0"
                    >
                      <span className="text-sm landing-muted">{row.title}</span>
                      <span
                        className={`text-sm font-medium ${
                          row.ok
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-500 dark:text-slate-500"
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* PLATFORM */}
        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="mb-12 max-w-2xl">
              <span className="landing-label">Platform</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight landing-heading">
                Complete payment stack, one integration
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <ScrollReveal className="md:col-span-4 landing-panel rounded-2xl p-8 md:p-10">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-5" />
                <h3 className="text-2xl font-semibold landing-heading mb-3">Borderless collections</h3>
                <p className="landing-body max-w-md">
                  Accept SOL from clients in any jurisdiction. No correspondent banking, no FX spread markup.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {["SOL", "Solana", "Global", "Instant"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100} className="md:col-span-2 landing-panel rounded-2xl p-8">
                <Zap className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                <h3 className="text-xl font-semibold landing-heading mt-6 mb-2">Real-time settlement</h3>
                <p className="text-sm landing-body">Sub-second on-chain finality.</p>
              </ScrollReveal>
              <ScrollReveal delay={150} className="md:col-span-2 landing-panel rounded-2xl p-8">
                <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-5" />
                <h3 className="text-xl font-semibold landing-heading mb-2">Final settlement</h3>
                <p className="text-sm landing-body">Irreversible after chain confirmation.</p>
              </ScrollReveal>
              <ScrollReveal delay={200} className="md:col-span-4 landing-panel rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                  <Code2 className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-5" />
                  <h3 className="text-2xl font-semibold landing-heading mb-3">REST API & webhooks</h3>
                  <p className="landing-body">
                    Production and sandbox keys, idempotent checkout creation, and signed event delivery.
                  </p>
                  <Link
                    href="/developer"
                    className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-cyan-700 dark:text-cyan-400 hover:underline"
                  >
                    API reference <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <pre className="flex-1 text-xs font-mono landing-muted bg-slate-100 dark:bg-black/40 rounded-xl p-4 border landing-border overflow-x-auto">
{`POST /api/v1/checkout
Authorization: Bearer <API_KEY>
{
  "amount": 10,
  "currency": "SOL",
  "orderId": "inv-1042"
}`}
                </pre>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* SECURITY + PAYMENT LINK */}
        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-14 items-start">
              <ScrollReveal variant="left" className="flex-1">
                <span className="landing-label">Security</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Non-custodial by architectural design
                </h2>
                <p className="landing-body max-w-lg mb-10">
                  Payments are orchestrated, not held. Every flow terminates in your designated wallet
                  with cryptographic proof on Solana.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Lock, title: "Zero custody", desc: "Wallet-to-wallet settlement" },
                    { icon: KeyRound, title: "API isolation", desc: "Per-environment credentials" },
                    { icon: FileCheck, title: "Signed webhooks", desc: "HMAC-SHA256 payloads" },
                    { icon: Wallet, title: "On-chain receipts", desc: "Verifiable audit trail" },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3 p-4 rounded-xl landing-panel">
                      <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm landing-heading">{item.title}</p>
                        <p className="text-xs landing-subtle mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <ul className="mt-10 space-y-3">
                  {[
                    { icon: LayoutTemplate, label: "Branded checkout pages" },
                    { icon: QrCode, label: "QR code generation" },
                    { icon: Send, label: "Automated receipts" },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-3 text-sm landing-body">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <item.icon className="w-4 h-4 landing-subtle" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="flex-1 w-full">
                <div className="landing-panel rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b landing-border">
                    <span className="flex items-center gap-2 text-sm font-medium landing-heading">
                      <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Payment link builder
                    </span>
                    <span className="text-[10px] uppercase tracking-wider landing-subtle bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">
                      No code
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider landing-subtle mb-1.5">Description</p>
                      <div className="rounded-lg bg-slate-50 dark:bg-white/5 border landing-border px-4 py-3 text-sm landing-body">
                        Enterprise SaaS — Q2 license
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider landing-subtle mb-1.5">Amount</p>
                      <div className="rounded-lg bg-slate-50 dark:bg-white/5 border landing-border px-4 py-3 flex justify-between items-center">
                        <span className="text-lg font-bold landing-heading">10.00</span>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/15 px-2 py-1 rounded border border-blue-200 dark:border-transparent">
                          SOL
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-[10px] uppercase tracking-wider landing-subtle mb-1.5">Payment URL</p>
                      <div className="flex gap-2">
                        <div className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 px-3 py-3 text-xs font-mono text-blue-800 dark:text-blue-300 truncate">
                          trezalink.com/pay/inv-8892x
                        </div>
                        <button
                          type="button"
                          aria-label="Copy link"
                          className="p-3 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
                        >
                          <Copy className="w-4 h-4 landing-muted" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="landing-section relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16 md:px-16 md:py-20 border-blue-200/50 dark:border-blue-500/20">
              <span className="landing-label">Get started</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">
                Deploy your payment stack this week
              </h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">
                Create a merchant account, connect your wallet, and issue your first payment link —
                no setup fees or monthly minimums.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="landing-btn-primary px-10 py-4">
                  Create merchant account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/developer" className="landing-btn-secondary px-10 py-4">
                  Explore API
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]">
        <Footer />
      </footer>
    </div>
  );
}
