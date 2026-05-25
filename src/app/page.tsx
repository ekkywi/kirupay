import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import HeroPaymentIllustration from "@/components/landing/HeroPaymentIllustration";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TrackingLink from "@/components/landing/TrackingLink";
import ScrollToSectionButton from "@/components/landing/ScrollToSectionButton";
import LandingAnalytics from "@/components/landing/LandingAnalytics";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CircleAlert,
  Clock3,
  CreditCard,
  Globe,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Global Solana Payments for Growing Teams | Trezalink",
  description:
    "Accept global Solana payments with transparent fees, direct wallet settlement, and a non-custodial merchant workflow.",
};

const SOCIAL_PROOF = [
  { value: "99.95%", label: "Target platform uptime" },
  { value: "0.3%", label: "Flat transaction fee" },
  { value: "<2 sec", label: "Median settlement speed" },
  { value: "24/7", label: "Global payment availability" },
];

const PAINS = [
  "Cross-border wire delays and FX friction",
  "Unclear processor pricing and hidden costs",
  "Settlement risk from custodial intermediaries",
];

const SOLUTIONS = [
  "Accept global SOL payments in minutes",
  "Know your exact fee before each transaction",
  "Settle directly into your merchant wallet",
];

const HOW_STEPS = [
  {
    id: "step-create",
    title: "Create a payment link",
    copy: "Set amount, order details, and your brand style in one flow.",
  },
  {
    id: "step-pay",
    title: "Customer pays on Solana",
    copy: "Payers use any compatible wallet and complete checkout in seconds.",
  },
  {
    id: "step-settle",
    title: "You receive direct settlement",
    copy: "Net funds land in your wallet with on-chain verification.",
  },
];

const TRUST_POINTS = [
  "Non-custodial flow: customer funds are never held by Trezalink",
  "Signed webhook payloads (HMAC-SHA256) for reliable backend automation",
  "Transparent fee math visible before settlement",
  "Network status and operational visibility for merchant teams",
];

const USE_CASES = [
  "Freelancers invoicing global clients",
  "SaaS teams collecting recurring renewals",
  "Agencies running borderless retainers",
  "Remote-first businesses reducing payout delays",
];

const FAQS = [
  {
    key: "chargebacks",
    q: "Do crypto payments have chargebacks?",
    a: "Solana transactions are final after confirmation. This removes traditional card chargeback exposure for settled payments.",
  },
  {
    key: "custody",
    q: "Does Trezalink hold merchant funds?",
    a: "No. Trezalink is non-custodial. Funds settle directly to the wallet you configure for your merchant account.",
  },
  {
    key: "settlement",
    q: "How fast is settlement?",
    a: "Most payments settle in under two seconds on Solana, depending on current network conditions.",
  },
  {
    key: "assets",
    q: "Which networks and assets are supported?",
    a: "Trezalink currently runs on Solana mainnet with SOL live. Additional assets such as USDC (SPL) are on the roadmap.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />
      <LandingAnalytics />

      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section data-track-section="hero" className="landing-section relative min-h-screen flex items-center pt-24 pb-12">
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                  <Globe className="w-3.5 h-3.5" />
                  Built for global SMB merchants
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.6rem] font-bold tracking-tight leading-[1.06]">
                  <span className="gradient-text">Get paid globally on Solana</span>
                  <br />
                  <span className="landing-heading">with clear fees and direct wallet settlement</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                  Launch a merchant checkout in minutes with a non-custodial payment flow,
                  transparent 0.3% pricing, and no setup fee.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <TrackingLink
                    href="/register"
                    eventName="cta_click"
                    eventData={{ placement: "hero_primary" }}
                    className="landing-btn-primary"
                  >
                    Create Merchant Account
                    <ArrowRight className="w-4 h-4" />
                  </TrackingLink>
                  <ScrollToSectionButton
                    targetId="how-it-works"
                    eventName="cta_click"
                    className="landing-btn-secondary"
                  >
                    See How It Works
                    <ArrowUpRight className="w-4 h-4" />
                  </ScrollToSectionButton>
                </div>
                <p className="mt-6 text-sm landing-subtle flex items-center justify-center lg:justify-start gap-2">
                  <BadgeCheck className="w-4 h-4" />
                  No setup fee · You keep custody · First link in minutes
                </p>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right">
                <HeroPaymentIllustration />
              </ScrollReveal>
            </div>

            <ScrollReveal delay={120} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {SOCIAL_PROOF.map((item, i) => (
                <ScrollReveal key={item.label} delay={i * 70} variant="fade" className="landing-panel rounded-xl px-5 py-4">
                  <p className="text-2xl md:text-3xl font-bold landing-heading">{item.value}</p>
                  <p className="text-xs landing-subtle mt-0.5 font-medium">{item.label}</p>
                </ScrollReveal>
              ))}
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="pain-solution" className="landing-section relative py-20" id="pain-solution">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-3xl mb-12">
              <span className="landing-label">Why teams switch</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                Remove payment friction without losing control
              </h2>
            </ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-6">
              <ScrollReveal className="landing-panel rounded-2xl p-7">
                <p className="text-sm font-semibold landing-heading mb-4">Common pain points</p>
                <ul className="space-y-3">
                  {PAINS.map((pain) => (
                    <li key={pain} className="flex items-start gap-3 text-sm landing-body">
                      <CircleAlert className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      {pain}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
              <ScrollReveal delay={80} className="landing-panel rounded-2xl p-7">
                <p className="text-sm font-semibold landing-heading mb-4">What Trezalink changes</p>
                <ul className="space-y-3">
                  {SOLUTIONS.map((solution) => (
                    <li key={solution} className="flex items-start gap-3 text-sm landing-body">
                      <Check className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {solution}
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="how-it-works" id="how-it-works" className="landing-section relative py-24">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-16">
              <span className="landing-label">How it works</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                Three steps from invoice to settlement
              </h2>
              <p className="mt-4 landing-body">
                Keep onboarding simple for your team while giving finance full visibility.
              </p>
            </ScrollReveal>
            <div className="grid md:grid-cols-3 gap-6">
              {HOW_STEPS.map((step, i) => (
                <ScrollReveal key={step.id} delay={i * 90} className="landing-panel rounded-2xl p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/15 border landing-border flex items-center justify-center mb-5 text-sm font-bold text-blue-700 dark:text-blue-400">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold landing-heading mb-2">{step.title}</h3>
                  <p className="text-sm landing-body">{step.copy}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="trust" className="landing-section relative py-24 bg-slate-100/55 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <ScrollReveal>
                <span className="landing-label">Trust and security</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                  Built for teams that need reliability and audit clarity
                </h2>
                <p className="mt-4 landing-body">
                  Use non-custodial payment infrastructure with merchant-ready controls and
                  visibility for operations.
                </p>
                <ul className="mt-8 space-y-3">
                  {TRUST_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm landing-body">
                      <Shield className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <TrackingLink
                  href="/status"
                  eventName="cta_click"
                  eventData={{ placement: "trust_status" }}
                  className="inline-flex items-center gap-1.5 mt-8 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View system status
                  <ArrowUpRight className="w-4 h-4" />
                </TrackingLink>
              </ScrollReveal>

              <ScrollReveal variant="right" className="landing-panel rounded-2xl p-8">
                <h3 className="text-lg font-semibold landing-heading mb-5">Settlement transparency snapshot</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm border-b landing-border pb-3">
                    <span className="landing-muted">Gross payment</span>
                    <span className="font-semibold landing-heading">10.00 SOL</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-b landing-border pb-3">
                    <span className="landing-muted">Trezalink fee (0.3%)</span>
                    <span className="font-semibold landing-heading">0.03 SOL</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-b landing-border pb-3">
                    <span className="landing-muted">Net to merchant wallet</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">9.97 SOL</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-b landing-border pb-3">
                    <span className="landing-muted">Settlement speed</span>
                    <span className="font-semibold landing-heading">Under 2 seconds</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="landing-muted">Custody model</span>
                    <span className="font-semibold landing-heading">Merchant wallet direct</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="use-cases" className="landing-section relative py-20">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-10">
              <span className="landing-label">Use cases</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                Built for modern global teams
              </h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {USE_CASES.map((item, idx) => (
                <ScrollReveal key={item} delay={idx * 60} className="landing-panel rounded-xl p-5 h-full">
                  <p className="text-sm landing-body">{item}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="faq" className="landing-section relative py-20">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal className="text-center mb-10">
              <span className="landing-label">FAQ</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                Questions merchants ask before launch
              </h2>
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
            <div className="mt-8 landing-panel rounded-xl p-5 text-left">
              <p className="font-semibold landing-heading">Technical details</p>
              <p className="mt-2 text-sm landing-body">
                Need implementation-level references? Review our API docs, webhook specs, and
                architecture notes before you go live.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <TrackingLink
                  href="/docs/quickstart"
                  eventName="cta_click"
                  eventData={{ placement: "faq_tech_quickstart" }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Quickstart <ArrowUpRight className="w-4 h-4" />
                </TrackingLink>
                <TrackingLink
                  href="/architecture"
                  eventName="cta_click"
                  eventData={{ placement: "faq_tech_architecture" }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Architecture <ArrowUpRight className="w-4 h-4" />
                </TrackingLink>
              </div>
            </div>
          </div>
        </section>

        <section data-track-section="final-cta" className="landing-section relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16 md:px-16 md:py-20 border-blue-200/50 dark:border-blue-500/20">
              <span className="landing-label">Get started</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">
                Start collecting global payments this week
              </h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">
                Create your merchant account, connect your wallet, and launch your first payment link
                in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Create Merchant Account
                  <ArrowRight className="w-4 h-4" />
                </TrackingLink>
                <TrackingLink
                  href="/docs/quickstart"
                  eventName="cta_click"
                  eventData={{ placement: "final_secondary" }}
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
          eventData={{ placement: "mobile_sticky" }}
          className="landing-btn-primary w-full shadow-lg shadow-blue-900/20"
        >
          <CreditCard className="w-4 h-4" />
          Create Merchant Account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t landing-border bg-slate-50 dark:bg-[#030712]">
        <Footer />
      </footer>
    </div>
  );
}
