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
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Shield,
  Wallet,
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
  "Payer funds go directly to merchant wallet, not pooled by Trezalink.",
  "Settlement finality reduces card-style chargeback exposure.",
  "Signed webhooks and logs support finance and ops reconciliation.",
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
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <PricingAnalytics />

      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>

      <main>
        <section data-track-section="pricing-hero" className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-12 items-center">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                  <CreditCard className="w-3.5 h-3.5" /> Conversion pricing
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                  <span className="gradient-text">Keep more of every global payment</span>
                  <br />
                  <span className="landing-heading">with one transparent 0.3% transaction fee</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                  Built for fast-moving merchants who want direct wallet settlement, no setup fee,
                  and no hidden platform pricing.
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
                    eventData={{ placement: "pricing_hero_primary" }}
                    className="landing-btn-primary"
                  >
                    Create Merchant Account
                    <ArrowRight className="w-4 h-4" />
                  </TrackingLink>
                  <ScrollToSectionButton
                    targetId="fee-calculator"
                    eventName="cta_click"
                    eventData={{ placement: "pricing_hero_secondary_calculator" }}
                    className="landing-btn-secondary"
                  >
                    Try Fee Calculator
                    <ArrowUpRight className="w-4 h-4" />
                  </ScrollToSectionButton>
                </div>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right" className="landing-panel rounded-2xl p-8">
                <p className="text-sm landing-subtle uppercase tracking-wider font-semibold">Single plan</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-6xl font-bold landing-heading">0.3%</span>
                  <span className="pb-2 text-sm landing-muted">per successful payment</span>
                </div>
                <div className="mt-8 space-y-4">
                  {HIDDEN_COSTS.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm landing-body">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {item}
                    </div>
                  ))}
                  <div className="flex items-center gap-3 text-sm landing-body">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Non-custodial settlement
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section id="fee-calculator" data-track-section="fee-calculator" className="landing-section relative py-24">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-14">
              <span className="landing-label">Fee calculator</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">Calculate gross, fee, and net in seconds</h2>
              <p className="mt-4 landing-body">Use your typical transaction size and see exactly what settles to your merchant wallet.</p>
            </ScrollReveal>

            <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 items-start">
              <ScrollReveal className="landing-panel rounded-2xl p-7">
                <label htmlFor="sol-amount" className="text-sm font-semibold landing-heading">Transaction amount (SOL)</label>
                <input
                  id="sol-amount"
                  type="number"
                  min="0"
                  step="0.000001"
                  value={amountInput}
                  onChange={(event) => onAmountChange(event.target.value)}
                  className="mt-3 w-full rounded-xl border landing-border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                  placeholder="10"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => onPresetClick(example)}
                      className="inline-flex items-center rounded-lg border landing-border px-3 py-1.5 text-xs font-semibold landing-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      {example} SOL
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs landing-subtle">Network fee is separate and depends on wallet/network conditions.</p>
              </ScrollReveal>

              <ScrollReveal delay={90} className="landing-panel rounded-2xl p-7">
                <div className="space-y-4">
                  <div className="flex justify-between border-b landing-border pb-3"><span className="landing-muted">Gross payment</span><span className="font-semibold landing-heading">{formatSol(amount)}</span></div>
                  <div className="flex justify-between border-b landing-border pb-3"><span className="landing-muted">Trezalink fee (0.3%)</span><span className="font-semibold landing-heading">{formatSol(fee)}</span></div>
                  <div className="flex justify-between border-b landing-border pb-3"><span className="landing-muted">Net to merchant wallet</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatSol(net)}</span></div>
                  <div className="flex justify-between"><span className="landing-muted">Settlement model</span><span className="font-semibold landing-heading">Wallet-direct</span></div>
                </div>

                <div className="mt-6 grid md:grid-cols-3 gap-3">
                  {EXAMPLES.map((value) => {
                    const sampleFee = value * FEE_RATE;
                    const sampleNet = value - sampleFee;

                    return (
                      <div key={value} className="rounded-xl border landing-border bg-slate-50 dark:bg-white/[0.03] p-4">
                        <p className="text-xs landing-subtle">{value.toFixed(2)} SOL</p>
                        <p className="mt-1 text-sm landing-body">Fee {sampleFee.toFixed(3)} SOL</p>
                        <p className="text-sm font-semibold landing-heading">Net {sampleNet.toFixed(3)} SOL</p>
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="objections" className="landing-section relative py-24 bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-start">
            <ScrollReveal>
              <span className="landing-label">Why safer than custodial processors</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">Keep control while still moving fast</h2>
              <div className="space-y-4">
                {TRUST_POINTS.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-xl border landing-border bg-white/70 dark:bg-white/[0.03] p-4">
                    <Shield className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-sm landing-body">{point}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100} variant="right" className="landing-panel rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <CircleDollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold landing-heading">No hidden cost policy</h3>
              </div>
              <div className="space-y-4">
                {HIDDEN_COSTS.map((item) => (
                  <div key={item} className="flex items-center gap-3 border-b landing-border pb-3 last:border-0 last:pb-0">
                    <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm landing-body">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t landing-border">
                <p className="text-sm font-semibold landing-heading mb-3">Included in the same 0.3% fee</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {INCLUDED.map((item) => (
                    <div key={item} className="rounded-lg border landing-border bg-slate-50 dark:bg-white/[0.03] px-3 py-2 text-xs landing-body">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="pricing-faq" className="landing-section relative py-20">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal className="text-center mb-10">
              <span className="landing-label">Pricing FAQ</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">Answers before you launch</h2>
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
              <span className="landing-label">Get started</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">Launch your first payment link in minutes</h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">
                Start with one transparent fee model today and scale global collections without custody friction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "pricing_final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Create Merchant Account
                  <ArrowRight className="w-4 h-4" />
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
          className="landing-btn-primary w-full shadow-lg shadow-blue-900/20"
        >
          <Wallet className="w-4 h-4" />
          Create Merchant Account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}
