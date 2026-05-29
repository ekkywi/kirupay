import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import HeroPaymentIllustration from "@/components/landing/HeroPaymentIllustration";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TrackingLink from "@/components/landing/TrackingLink";
import LandingAnalytics from "@/components/landing/LandingAnalytics";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Check,
  Clock3,
  Code2,
  CreditCard,
  Globe2,
  Layers3,
  Link2,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Webhook,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Lightweight Solana Payment Infrastructure | Trezalink",
  description:
    "Launch Solana payment links, settle directly to your wallet, and operate global merchant payments with transparent 0.3% fees.",
};

const MERCHANT_TYPES = [
  "SaaS teams",
  "Global agencies",
  "Creator platforms",
  "Remote services",
  "Crypto commerce",
  "Digital invoices",
  "Marketplaces",
  "Subscription ops",
];

const USE_CASES = [
  {
    title: "Payment links",
    copy: "Create clean checkout URLs for one-off orders, invoices, or project milestones.",
    icon: Link2,
  },
  {
    title: "Global invoices",
    copy: "Let international customers pay without wire delays or opaque processor fees.",
    icon: Globe2,
  },
  {
    title: "SaaS renewals",
    copy: "Collect recurring customer payments with direct settlement visibility for finance.",
    icon: RadioTower,
  },
  {
    title: "Agency retainers",
    copy: "Send branded payment requests and confirm settlement in seconds, not days.",
    icon: Layers3,
  },
  {
    title: "Crypto-native commerce",
    copy: "Give wallet-first customers a simple Solana checkout that feels familiar.",
    icon: WalletCards,
  },
];

const FLOW_OPTIONS = [
  {
    eyebrow: "Checkout type",
    title: "Hosted payment link",
    choices: ["Single invoice", "Reusable link", "Order checkout"],
  },
  {
    eyebrow: "Settlement",
    title: "Merchant wallet direct",
    choices: ["SOL mainnet", "0.3% fee", "No custody"],
  },
  {
    eyebrow: "Automation",
    title: "Signed webhooks",
    choices: ["Payment paid", "Expired", "Recovered"],
  },
];

const MODULES = [
  {
    title: "Checkout links",
    copy: "Generate payment sessions with amount, order metadata, and customer context.",
    points: ["Hosted checkout", "Order references", "Expiry controls"],
    icon: Link2,
  },
  {
    title: "Wallet settlement",
    copy: "Funds move directly to the merchant wallet with transparent fee math.",
    points: ["Non-custodial", "Fee preview", "On-chain proof"],
    icon: WalletCards,
  },
  {
    title: "Webhooks",
    copy: "Automate fulfillment with signed events your backend can verify.",
    points: ["HMAC signatures", "Retry visibility", "Event logs"],
    icon: Webhook,
  },
  {
    title: "Merchant dashboard",
    copy: "Monitor transactions, exports, and operational status from one workspace.",
    points: ["Revenue view", "CSV exports", "Status context"],
    icon: BarChart3,
  },
];

const CAPABILITIES = [
  {
    value: "<2 sec",
    label: "Median Solana settlement target",
    icon: Zap,
  },
  {
    value: "0.3%",
    label: "Transparent transaction fee",
    icon: Check,
  },
  {
    value: "0 custody",
    label: "Funds settle to your wallet",
    icon: LockKeyhole,
  },
  {
    value: "24/7",
    label: "Borderless payment availability",
    icon: Globe2,
  },
];

const OPERATIONS = [
  "Live payment status across pending, paid, expired, and recovered sessions",
  "Webhook delivery logs for faster developer debugging",
  "Transaction export tools built for finance review",
  "Network and maintenance visibility before incidents become mystery meat",
];

export default function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-400/25">
      <PageBackground />
      <LandingAnalytics />

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section data-track-section="hero" className="landing-section relative min-h-screen pt-28 pb-12 md:pt-36">
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[0.96fr_1.04fr]">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="landing-pill mb-6 inline-flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Launch, collect, and settle globally
                </span>
                <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.075em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[5.35rem] dark:text-white">
                  Solana payments infrastructure. Zero custody friction.
                </h1>
                <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl lg:mx-0 dark:text-slate-300">
                  Trezalink helps modern merchants accept global Solana payments with hosted links,
                  transparent fees, signed webhooks, and direct wallet settlement.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <TrackingLink
                    href="/register"
                    eventName="cta_click"
                    eventData={{ placement: "hero_primary" }}
                    className="landing-btn-primary"
                  >
                    Create Merchant Account
                    <ArrowRight className="h-4 w-4" />
                  </TrackingLink>
                  <TrackingLink
                    href="/docs/quickstart"
                    eventName="cta_click"
                    eventData={{ placement: "hero_quickstart" }}
                    className="landing-btn-secondary"
                  >
                    Read Quickstart
                    <ArrowUpRight className="h-4 w-4" />
                  </TrackingLink>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-500 lg:justify-start dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" />No setup fee</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-flex dark:bg-slate-600" />
                  <span>Merchant-owned funds</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-flex dark:bg-slate-600" />
                  <span>First link in minutes</span>
                </div>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right">
                <HeroPaymentIllustration />
              </ScrollReveal>
            </div>

            <ScrollReveal delay={180} className="landing-marquee-panel overflow-hidden rounded-[2rem] py-4">
              <p className="px-5 pb-3 text-center text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                Built for merchant teams moving money across borders
              </p>
              <div className="flex flex-wrap justify-center gap-2 px-4">
                {MERCHANT_TYPES.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="use-cases" className="landing-section relative py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mx-auto mb-12 max-w-3xl text-center">
              <span className="landing-label">Use cases</span>
              <h2 className="landing-display mt-3">One checkout layer, many merchant motions</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                Keep the payment experience simple for customers while giving your team the tools to reconcile, automate, and scale.
              </p>
            </ScrollReveal>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {USE_CASES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={idx * 55} className="landing-card group h-full rounded-[1.6rem] p-5">
                    <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition-transform group-hover:-translate-y-1 dark:bg-blue-400/10 dark:text-cyan-300">
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

        <section data-track-section="flow-designer" className="landing-section relative py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[0.92fr_1.08fr]">
            <ScrollReveal>
              <span className="landing-label">Design your payment flow</span>
              <h2 className="landing-display mt-3">Configure the path from invoice to wallet.</h2>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                Choose how customers pay, where funds settle, and which backend events your team needs. The interface feels simple because the hard parts stay behind the API.
              </p>
              <TrackingLink
                href="/docs/payment-links"
                eventName="cta_click"
                eventData={{ placement: "flow_docs" }}
                className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800 dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                Explore payment links <ArrowUpRight className="h-4 w-4" />
              </TrackingLink>
            </ScrollReveal>

            <ScrollReveal variant="right" className="landing-showcase rounded-[2rem] p-4 sm:p-6">
              <div className="grid gap-4 md:grid-cols-[0.82fr_1.18fr]">
                <div className="space-y-3">
                  {FLOW_OPTIONS.map((option, idx) => (
                    <div key={option.title} className="rounded-[1.25rem] border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400">{option.eyebrow}</p>
                      <h3 className="mt-2 text-base font-black text-slate-950 dark:text-white">{option.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {option.choices.map((choice) => (
                          <span key={choice} className={`rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${idx === 1 ? "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-cyan-300" : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"}`}>
                            {choice}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative min-h-[370px] overflow-hidden rounded-[1.5rem] bg-slate-950 p-5 text-white">
                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/22 blur-3xl" />
                  <div className="absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
                  <div className="relative flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    <span>Trezalink checkout</span>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-200">Live</span>
                  </div>
                  <div className="relative mt-10 rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20">
                    <p className="text-sm text-slate-400">Invoice #TL-2049</p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-4xl font-black tracking-tight">10.00 SOL</p>
                        <p className="mt-2 text-sm text-slate-400">Customer pays with any Solana wallet</p>
                      </div>
                      <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white text-slate-950">
                        <CreditCard className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-600 px-4 py-3 text-center text-sm font-black text-slate-950">
                      Pay securely
                    </div>
                  </div>
                  <div className="relative mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <p className="text-slate-400">Fee</p>
                      <p className="mt-1 font-black">0.03 SOL</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <p className="text-slate-400">Net settled</p>
                      <p className="mt-1 font-black text-emerald-200">9.97 SOL</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="modules" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mb-12 max-w-3xl">
              <span className="landing-label">Modular platform</span>
              <h2 className="landing-display mt-3">Everything needed to launch and operate Solana payments.</h2>
            </ScrollReveal>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={idx * 70} className="landing-card h-full rounded-[1.7rem] p-6">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.copy}</p>
                    <ul className="mt-5 space-y-2">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <Check className="h-4 w-4 text-emerald-500" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section data-track-section="capabilities" className="landing-section relative py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="landing-showcase rounded-[2rem] p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <ScrollReveal>
                  <span className="landing-label">Key capabilities</span>
                  <h2 className="landing-display mt-3">Built to feel fast, clear, and under your control.</h2>
                </ScrollReveal>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {CAPABILITIES.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <ScrollReveal key={item.value} delay={idx * 60} className="rounded-[1.4rem] border border-slate-200/80 bg-white/75 p-5 dark:border-white/10 dark:bg-slate-950/45">
                        <Icon className="h-5 w-5 text-emerald-600 dark:text-cyan-300" />
                        <p className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{item.value}</p>
                        <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{item.label}</p>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section data-track-section="operations" className="landing-section relative py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1.08fr_0.92fr]">
            <ScrollReveal className="landing-dashboard rounded-[2rem] p-4 sm:p-6">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950 p-5 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Merchant operations</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight">Payments dashboard</h3>
                  </div>
                  <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-slate-300">Today</span>
                </div>
                <div className="grid gap-3 py-5 sm:grid-cols-3">
                  {["Paid", "Pending", "Recovered"].map((label, idx) => (
                    <div key={label} className="rounded-2xl bg-white/[0.06] p-4">
                      <p className="text-sm text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-black">{idx === 0 ? "128" : idx === 1 ? "14" : "6"}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {["TL-2049", "TL-2048", "TL-2047"].map((id, idx) => (
                    <div key={id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div>
                        <p className="font-bold">{id}</p>
                        <p className="mt-1 text-sm text-slate-400">{idx === 0 ? "SaaS renewal" : idx === 1 ? "Global invoice" : "Agency retainer"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black">{idx === 0 ? "10.00" : idx === 1 ? "3.25" : "18.40"} SOL</p>
                        <p className="mt-1 text-xs font-bold text-emerald-300">Settled</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="right">
              <span className="landing-label">Dashboard and status</span>
              <h2 className="landing-display mt-3">Operate payments without the black box.</h2>
              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                Trezalink gives business, finance, and developer teams a shared view of payment health so fewer questions become support tickets.
              </p>
              <ul className="mt-8 space-y-4">
                {OPERATIONS.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-cyan-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <TrackingLink href="/status" eventName="cta_click" eventData={{ placement: "operations_status" }} className="landing-link-button">
                  View status <ArrowUpRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink href="/developer" eventName="cta_click" eventData={{ placement: "operations_api" }} className="landing-link-button">
                  API overview <Code2 className="h-4 w-4" />
                </TrackingLink>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="final-cta" className="landing-section relative py-24 pb-32 md:pb-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <ScrollReveal variant="scale" className="landing-final rounded-[2.4rem] px-6 py-16 sm:px-10 md:py-20">
              <span className="landing-pill inline-flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5" />
                Get started this week
              </span>
              <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
                Start collecting global Solana payments without handing over custody.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Create a merchant account, connect your settlement wallet, and publish your first payment link in minutes.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <TrackingLink href="/register" eventName="cta_click" eventData={{ placement: "final_primary" }} className="landing-btn-primary px-10 py-4">
                  Create Merchant Account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink href="/docs/quickstart" eventName="cta_click" eventData={{ placement: "final_quickstart" }} className="landing-btn-secondary px-10 py-4">
                  Read Quickstart
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
          eventData={{ placement: "mobile_sticky" }}
          className="landing-btn-primary w-full shadow-lg shadow-blue-950/20"
        >
          <CreditCard className="h-4 w-4" />
          Create Merchant Account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t border-slate-200/70 bg-[#f4f7ff] dark:border-white/10 dark:bg-[#060818]">
        <Footer />
      </footer>
    </div>
  );
}
