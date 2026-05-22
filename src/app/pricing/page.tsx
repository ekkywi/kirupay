import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, CreditCard, ReceiptText, ShieldCheck, TrendingDown, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
};

const EXAMPLES = [
  { gross: "1.00 SOL", fee: "0.003 SOL", net: "0.997 SOL" },
  { gross: "10.00 SOL", fee: "0.03 SOL", net: "9.97 SOL" },
  { gross: "100.00 SOL", fee: "0.30 SOL", net: "99.70 SOL" },
];

const INCLUDED = [
  "Hosted checkout pages",
  "Manual payment links",
  "Checkout API access",
  "Webhook signing and logs",
  "Merchant dashboard analytics",
  "Wallet-direct settlement",
];

export default function PricingPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4"><Navbar /></div>

      <main>
        <section className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-12 items-center">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                  <CreditCard className="w-3.5 h-3.5" /> Pricing
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                  <span className="gradient-text">Simple 0.3% pricing</span>
                  <br />
                  <span className="landing-heading">for every paid transaction</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                  Trezalink charges a flat platform fee when a payment succeeds. No setup fee,
                  no monthly minimum, and no custody layer between payer and merchant wallet.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/register" className="landing-btn-primary">Create account <ArrowRight className="w-4 h-4" /></Link>
                  <Link href="/docs" className="landing-btn-secondary">Read docs</Link>
                </div>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right" className="landing-panel rounded-2xl p-8">
                <p className="text-sm landing-subtle uppercase tracking-wider font-semibold">Platform fee</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-6xl font-bold landing-heading">0.3%</span>
                  <span className="pb-2 text-sm landing-muted">per successful payment</span>
                </div>
                <div className="mt-8 space-y-4">
                  {["No setup fee", "No subscription fee", "No fund custody", "Net amount recorded after fee"].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm landing-body">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {item}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-14">
              <span className="landing-label">Fee math</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">Gross, fee, and net are transparent</h2>
              <p className="mt-4 landing-body">The app stores `feeAmount` and `netAmount` after payment confirmation, so finance teams can reconcile settlement clearly.</p>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-4">
              {EXAMPLES.map((row, index) => (
                <ScrollReveal key={row.gross} delay={index * 90} className="landing-panel rounded-2xl p-6">
                  <ReceiptText className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-6" />
                  <div className="space-y-4">
                    <div className="flex justify-between border-b landing-border pb-3"><span className="landing-muted">Gross</span><span className="font-semibold landing-heading">{row.gross}</span></div>
                    <div className="flex justify-between border-b landing-border pb-3"><span className="landing-muted">Fee</span><span className="font-semibold landing-heading">{row.fee}</span></div>
                    <div className="flex justify-between"><span className="landing-muted">Net</span><span className="font-semibold text-blue-600 dark:text-blue-400">{row.net}</span></div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal variant="left">
              <span className="landing-label">Included</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">One fee covers the payment stack</h2>
              <p className="landing-body mb-8">The same pricing model applies whether the payment starts from a dashboard payment link or a checkout API request.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {INCLUDED.map((item) => (
                  <div key={item} className="landing-panel rounded-xl p-5 flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold landing-heading">{item}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal variant="right" className="landing-panel rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold landing-heading">What Trezalink does not charge for</h3>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Wallet, text: "Holding balances, because funds settle to your wallet." },
                  { icon: ShieldCheck, text: "Chargeback handling, because settlement is final after confirmation." },
                  { icon: CreditCard, text: "Monthly platform access, setup, or minimum volume." },
                ].map((item) => (
                  <div key={item.text} className="flex gap-3 border-b landing-border pb-4 last:border-0 last:pb-0">
                    <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-sm landing-body">{item.text}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]"><Footer /></footer>
    </div>
  );
}