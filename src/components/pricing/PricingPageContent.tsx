"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TrackingLink from "@/components/landing/TrackingLink";
import ScrollToSectionButton from "@/components/landing/ScrollToSectionButton";
import PricingAnalytics from "@/components/pricing/PricingAnalytics";
import { trackLandingEvent } from "@/components/landing/landing-analytics";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Wallet,
  Webhook,
  Zap,
} from "lucide-react";

const FEE_RATE = 0.003;
const CALCULATOR_DEBOUNCE_MS = 300;

const EXAMPLES = [1, 10, 100];

const WHO_FOR = [
  "Global SMB merchants",
  "Non-custodial payment flows",
  "No setup fee and no minimum volume",
];

const TRUST_POINTS = [
  {
    title: "Direct wallet settlement",
    copy: "Payer funds go directly to merchant wallet, not pooled by Trezalink.",
    icon: Wallet,
  },
  {
    title: "Final settlement clarity",
    copy: "Settlement finality reduces card-style chargeback exposure after confirmation.",
    icon: ShieldCheck,
  },
  {
    title: "Finance-ready logs",
    copy: "Signed webhooks and logs support finance and ops reconciliation.",
    icon: FileText,
  },
];

const HIDDEN_COSTS = [
  "No setup fee",
  "No monthly subscription",
  "No minimum transaction volume",
];

const INCLUDED = [
  "Hosted checkout pages",
  "Manual payment links",
  "Checkout API access",
  "Webhook signing and logs",
  "Merchant dashboard analytics",
  "Wallet-direct settlement",
];

const MODULES = [
  {
    title: "One transparent fee",
    copy: "Every successful payment uses the same 0.3% platform fee, so reconciliation stays predictable.",
    icon: CircleDollarSign,
  },
  {
    title: "Signed automation",
    copy: "Webhook signing and delivery logs are included, not hidden behind a higher plan.",
    icon: Webhook,
  },
  {
    title: "Operational visibility",
    copy: "Dashboard analytics and exports help teams review payment performance and settlement math.",
    icon: BarChart3,
  },
  {
    title: "Merchant control",
    copy: "Trezalink stays non-custodial, with funds settling to the wallet your business configures.",
    icon: LockKeyhole,
  },
];

const FAQS = [
  {
    key: "chargebacks",
    q: "Do crypto payments have chargebacks?",
    a: "Solana transactions are final after confirmation, so settled payments do not follow traditional card chargeback flow.",
  },
  {
    key: "settlement",
    q: "How fast is settlement?",
    a: "Most payments settle in under two seconds on Solana, depending on network conditions.",
  },
  {
    key: "custody",
    q: "Does Trezalink hold merchant funds?",
    a: "No. Trezalink is non-custodial. Funds settle directly to the wallet configured by the merchant.",
  },
];

function formatSol(value: number) {
  return `${value.toFixed(6).replace(/\.?0+$/, "")} SOL`;
}

export default function PricingPageContent() {
  const [amountInput, setAmountInput] = useState("10");

  const amount = useMemo(() => {
    const parsed = Number.parseFloat(amountInput);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
  }, [amountInput]);

  const fee = amount * FEE_RATE;
  const net = Math.max(0, amount - fee);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      trackLandingEvent("calculator_used", {
        source: "manual",
        amount: amountInput,
      });
    }, CALCULATOR_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [amountInput]);

  const onAmountChange = (value: string) => {
    setAmountInput(value);
  };

  const onPresetClick = (value: number) => {
    const amountValue = value.toString();
    setAmountInput(amountValue);
    trackLandingEvent("calculator_used", {
      source: "preset",
      amount: amountValue,
    });
  };

  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-400/25">
      <PageBackground />
      <PricingAnalytics />

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section data-track-section="pricing-hero" className="landing-section relative min-h-screen pt-28 pb-16 md:pt-36">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[0.94fr_1.06fr]">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="landing-pill mb-6 inline-flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5" />
                  Conversion pricing
                </span>
                <h1 className="max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.065em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[5rem] dark:text-white">
                  One clear fee for global Solana payments.
                </h1>
                <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl lg:mx-0 dark:text-slate-300">
                  Keep pricing simple with direct wallet settlement, no setup fee, no subscription,
                  and one transparent 0.3% transaction fee.
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
                    eventData={{ placement: "pricing_hero_primary" }}
                    className="landing-btn-primary"
                  >
                    Create Merchant Account
                    <ArrowRight className="h-4 w-4" />
                  </TrackingLink>
                  <ScrollToSectionButton
                    targetId="fee-calculator"
                    eventName="cta_click"
                    className="landing-btn-secondary"
                  >
                    Try Fee Calculator
                    <ArrowUpRight className="h-4 w-4" />
                  </ScrollToSectionButton>
                </div>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right" className="landing-showcase rounded-[2rem] p-5 sm:p-6">
                <div className="rounded-[1.5rem] border border-white/70 bg-white/76 p-6 shadow-2xl shadow-slate-900/8 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/30">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-blue-700 dark:text-cyan-300">Single plan</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Per successful payment</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-blue-800 dark:bg-emerald-300/10 dark:text-cyan-200">
                      No hidden tiers
                    </span>
                  </div>

                  <div className="mt-8 flex items-end gap-3">
                    <span className="text-7xl font-black tracking-[-0.07em] text-slate-950 sm:text-8xl dark:text-white">0.3%</span>
                    <span className="pb-4 text-sm font-bold text-slate-500 dark:text-slate-400">flat fee</span>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {HIDDEN_COSTS.map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <Check className="mb-3 h-4 w-4 text-emerald-600 dark:text-cyan-300" />
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.25rem] bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-400 dark:text-slate-500">10.00 SOL gross</span>
                      <span className="font-black">9.97 SOL settled</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-white/10 dark:bg-slate-950/10">
                      <div className="h-full w-[99.7%] rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section id="fee-calculator" data-track-section="fee-calculator" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mx-auto mb-14 max-w-3xl text-center">
              <span className="landing-label">Fee calculator</span>
              <h2 className="landing-display mt-3">See gross, fee, and net before checkout.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                Use your typical transaction size and see exactly what settles to your merchant wallet.
              </p>
            </ScrollReveal>

            <div className="landing-showcase rounded-[2rem] p-4 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
                <ScrollReveal className="rounded-[1.5rem] border border-white/70 bg-white/76 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/62">
                  <label htmlFor="sol-amount" className="text-sm font-black text-slate-950 dark:text-white">Transaction amount</label>
                  <div className="mt-3 flex items-center gap-3 rounded-[1.25rem] border border-slate-200/80 bg-white/88 px-4 py-3 shadow-sm shadow-slate-900/5 focus-within:border-blue-400 dark:border-white/10 dark:bg-white/[0.04]">
                    <input
                      id="sol-amount"
                      type="number"
                      min="0"
                      step="0.000001"
                      value={amountInput}
                      onChange={(event) => onAmountChange(event.target.value)}
                      className="w-full bg-transparent text-3xl font-black tracking-[-0.04em] text-slate-950 outline-none placeholder:text-slate-300 dark:text-white dark:placeholder:text-slate-700"
                      placeholder="10"
                    />
                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-blue-800 dark:bg-emerald-300/10 dark:text-cyan-200">SOL</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {EXAMPLES.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => onPresetClick(example)}
                        className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-black text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-cyan-200"
                      >
                        {example} SOL
                      </button>
                    ))}
                  </div>

                  <div className="mt-7 space-y-3">
                    {[
                      ["Gross payment", formatSol(amount)],
                      ["Trezalink fee", formatSol(fee)],
                      ["Merchant receives", formatSol(net)],
                    ].map(([label, value], index) => (
                      <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black ${index === 2 ? "bg-emerald-100 text-blue-700 dark:bg-emerald-300/10 dark:text-cyan-200" : "bg-white text-slate-500 dark:bg-white/[0.05] dark:text-slate-300"}`}>
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                          <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-xs leading-5 text-slate-400 dark:text-slate-500">
                    Network fee is separate and depends on wallet/network conditions.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={90} variant="right" className="rounded-[1.5rem] bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 dark:border-slate-950/10">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300 dark:text-blue-700">Settlement preview</p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight">Payment economics</h3>
                    </div>
                    <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-slate-300 dark:bg-slate-950/8 dark:text-slate-600">Wallet-direct</span>
                  </div>

                  <div className="py-7">
                    <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                      <div className="rounded-2xl bg-white/[0.06] p-4 dark:bg-slate-950/[0.04]">
                        <p className="text-sm text-slate-400 dark:text-slate-500">Gross</p>
                        <p className="mt-2 text-xl font-black">{formatSol(amount)}</p>
                      </div>
                      <ArrowRight className="mx-auto h-5 w-5 text-emerald-300 dark:text-blue-700" />
                      <div className="rounded-2xl bg-white/[0.06] p-4 dark:bg-slate-950/[0.04]">
                        <p className="text-sm text-slate-400 dark:text-slate-500">Fee</p>
                        <p className="mt-2 text-xl font-black">{formatSol(fee)}</p>
                      </div>
                      <ArrowRight className="mx-auto h-5 w-5 text-emerald-300 dark:text-blue-700" />
                      <div className="rounded-2xl bg-emerald-300 p-4 text-slate-950">
                        <p className="text-sm text-emerald-900/70">Net</p>
                        <p className="mt-2 text-xl font-black">{formatSol(net)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {EXAMPLES.map((value) => {
                      const sampleFee = value * FEE_RATE;
                      const sampleNet = value - sampleFee;

                      return (
                        <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 dark:border-slate-950/10 dark:bg-slate-950/[0.035]">
                          <p className="text-xs text-slate-400 dark:text-slate-500">{value.toFixed(2)} SOL</p>
                          <p className="mt-1 text-sm">Fee {sampleFee.toFixed(3)} SOL</p>
                          <p className="text-sm font-black text-emerald-200 dark:text-blue-700">Net {sampleNet.toFixed(3)} SOL</p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        <section data-track-section="objections" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mb-12 max-w-3xl">
              <span className="landing-label">What is included</span>
              <h2 className="landing-display mt-3">The same fee covers the operational pieces too.</h2>
            </ScrollReveal>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={idx * 70} className="landing-card h-full rounded-[1.7rem] p-6">
                    <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.copy}</p>
                  </ScrollReveal>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <ScrollReveal className="landing-card rounded-[1.7rem] p-6">
                <p className="landing-label">Control without custody</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Keep control while still moving fast.</h3>
                <div className="mt-6 space-y-3">
                  {TRUST_POINTS.map((point) => {
                    const Icon = point.icon;
                    return (
                      <div key={point.title} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/64 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-cyan-300" />
                        <div>
                          <p className="font-black text-slate-950 dark:text-white">{point.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{point.copy}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={100} variant="right" className="landing-card rounded-[1.7rem] p-6">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-cyan-300" />
                  <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">No hidden cost policy</h3>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {HIDDEN_COSTS.map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200/80 bg-white/64 p-4 text-sm font-black text-slate-800 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-200">
                      <Check className="mb-3 h-4 w-4 text-emerald-600 dark:text-cyan-300" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-slate-200/70 pt-6 dark:border-white/10">
                  <p className="text-sm font-black text-slate-950 dark:text-white">Included in the same 0.3% fee</p>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {INCLUDED.map((item) => (
                      <div key={item} className="rounded-full border border-slate-200/80 bg-white/64 px-4 py-2 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="pricing-faq" className="landing-section relative py-20">
          <div className="mx-auto max-w-4xl px-6">
            <ScrollReveal className="mb-10 text-center">
              <span className="landing-label">Pricing FAQ</span>
              <h2 className="landing-display mt-3">Answers before you launch</h2>
            </ScrollReveal>
            <div className="space-y-3">
              {FAQS.map((item, idx) => (
                <ScrollReveal key={item.key} delay={idx * 45}>
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
                <Zap className="h-3.5 w-3.5" />
                Get started
              </span>
              <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
                Launch your first payment link with one transparent fee model.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Start with simple pricing today and scale global collections without custody friction.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "pricing_final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Create Merchant Account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink
                  href="/docs/quickstart"
                  eventName="cta_click"
                  eventData={{ placement: "pricing_final_secondary_quickstart" }}
                  className="landing-btn-secondary px-10 py-4"
                >
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
          eventData={{ placement: "pricing_mobile_sticky" }}
          className="landing-btn-primary w-full shadow-lg shadow-blue-950/20"
        >
          <Wallet className="h-4 w-4" />
          Create Merchant Account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t border-slate-200/70 bg-[#f4f7ff] dark:border-white/10 dark:bg-[#060818]">
        <Footer />
      </footer>
    </div>
  );
}
