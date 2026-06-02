import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import TrackingLink from "@/components/landing/TrackingLink";
import LandingAnalytics from "@/components/landing/LandingAnalytics";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDollarSign,
  Code2,
  Globe2,
  Layers3,
  LockKeyhole,
  Store,
  Users,
  WalletCards,
  Webhook,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "Solana payment workflows for freelancers, agencies, SaaS teams, marketplaces, and developer-led products with non-custodial settlement, payment links, API/webhooks, and a transparent 0.3% fee.",
};

const TRUST_CHIPS = [
  "Non-custodial settlement",
  "Transparent 0.3% fee",
  "Payment links, API, and webhooks",
];

const USE_CASES = [
  {
    icon: BriefcaseBusiness,
    title: "Freelancers",
    desc: "Collect cross-border SOL payments with a hosted payment link and direct wallet settlement.",
    points: ["No-code payment links", "Customer email reference", "Simple gross-to-net records"],
  },
  {
    icon: Users,
    title: "Agencies",
    desc: "Issue project or retainer payment links while keeping finance visibility in the dashboard.",
    points: ["Unique order IDs", "Payment history", "Webhook notifications"],
  },
  {
    icon: Building2,
    title: "SaaS teams",
    desc: "Create checkout sessions from backend services and reconcile paid accounts through webhooks.",
    points: ["Checkout API", "Bearer API keys", "payment.success events"],
  },
  {
    icon: Store,
    title: "Marketplaces",
    desc: "Prototype Solana-native collections before building deeper marketplace payment workflows.",
    points: ["Hosted checkout", "Transaction logs", "Admin oversight"],
  },
  {
    icon: Globe2,
    title: "Remote teams",
    desc: "Accept wallet-direct payments from global clients without correspondent banking delays.",
    points: ["SOL settlement", "Final payments", "Dashboard reporting"],
  },
  {
    icon: Layers3,
    title: "Developer-led products",
    desc: "Use Trezalink as the payment layer while your app owns the customer experience.",
    points: ["REST checkout", "Redirect URLs", "Webhook logs"],
  },
];

const VALUE_POINTS = [
  {
    icon: Globe2,
    title: "Cross-border by default",
    copy: "Let customers pay from any supported Solana wallet without waiting on correspondent banks or regional card rails.",
  },
  {
    icon: WalletCards,
    title: "Settlement stays yours",
    copy: "Trezalink stays non-custodial, so funds settle directly to the merchant wallet configured by your team.",
  },
  {
    icon: Webhook,
    title: "Automation when you need it",
    copy: "Start with payment links, then graduate to checkout sessions and signed webhooks as workflow complexity grows.",
  },
];

const CAPABILITIES = [
  {
    icon: Zap,
    title: "Hosted payment links",
    copy: "Launch invoices, retainers, and checkout URLs without building a custom payment form first.",
  },
  {
    icon: Code2,
    title: "Checkout API",
    copy: "Create payment sessions from backend services while preserving your product's customer experience.",
  },
  {
    icon: Webhook,
    title: "Signed webhooks",
    copy: "Fulfill, reconcile, and debug payment states with backend events and delivery visibility.",
  },
  {
    icon: BarChart3,
    title: "Dashboard visibility",
    copy: "Give operations and finance teams payment history, status context, and exportable transaction records.",
  },
  {
    icon: LockKeyhole,
    title: "Wallet-direct settlement",
    copy: "Avoid platform custody while keeping a clean checkout experience for customers.",
  },
  {
    icon: CircleDollarSign,
    title: "Transparent 0.3% fee",
    copy: "Keep gross, fee, and net settlement math easy to explain across product and finance teams.",
  },
];

const FAQS = [
  {
    key: "custody",
    q: "Does Trezalink hold merchant funds?",
    a: "No. Trezalink is non-custodial. Funds settle directly to the merchant wallet configured for the business.",
  },
  {
    key: "fee",
    q: "What fee should teams expect?",
    a: "Successful payments use a transparent 0.3% Trezalink platform fee, with network fees handled separately by wallet and network conditions.",
  },
  {
    key: "automation",
    q: "Can we start with links and add API automation later?",
    a: "Yes. Teams can begin with hosted payment links, then use checkout API sessions and signed webhooks for deeper product workflows.",
  },
  {
    key: "settlement",
    q: "How does settlement work?",
    a: "Customers authorize payments through a Solana wallet, and confirmed funds settle to the merchant wallet with gross, fee, and net records for review.",
  },
];

export default function UseCasesPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-400/25">
      <PageBackground />
      <LandingAnalytics />

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section data-track-section="use-cases-hero" className="landing-section relative min-h-screen pt-28 pb-16 md:pt-36">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 lg:grid-cols-[0.94fr_1.06fr]">
            <ScrollReveal immediate className="text-center lg:text-left">
              <span className="landing-pill mb-6 inline-flex items-center gap-2">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Use cases
              </span>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.065em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[5rem] dark:text-white">
                Solana payment workflows for modern internet teams.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl lg:mx-0 dark:text-slate-300">
                Trezalink fits teams that need fast wallet-direct collections, simple payment links,
                and an API path for deeper automation without adding custody risk.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
                {TRUST_CHIPS.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-black text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "use_cases_hero_primary" }}
                  className="landing-btn-primary"
                >
                  Open merchant account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink
                  href="/developer"
                  eventName="cta_click"
                  eventData={{ placement: "use_cases_hero_secondary_api" }}
                  className="landing-btn-secondary"
                >
                  Explore API
                  <ArrowUpRight className="h-4 w-4" />
                </TrackingLink>
              </div>
            </ScrollReveal>

            <ScrollReveal immediate delay={120} variant="right" className="landing-showcase rounded-[2rem] p-5 sm:p-6">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/76 shadow-2xl shadow-slate-900/8 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/30">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
                  <div>
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-blue-700 dark:text-cyan-300">Workflow console</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">From link to settlement</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-blue-800 dark:bg-emerald-300/10 dark:text-cyan-200">
                    Live flow
                  </span>
                </div>

                <div className="grid gap-4 p-5 lg:grid-cols-[0.84fr_1.16fr]">
                  <div className="space-y-3">
                    {[
                      ["1", "Create link", "Invoice #TL-2049"],
                      ["2", "Customer pays", "10.00 SOL"],
                      ["3", "Wallet settles", "9.97 SOL net"],
                    ].map(([step, label, value]) => (
                      <div key={step} className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">{step}</span>
                          <div>
                            <p className="text-sm font-black text-slate-950 dark:text-white">{label}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative min-h-[330px] overflow-hidden rounded-[1.5rem] bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/22 blur-3xl dark:bg-violet-400/16" />
                    <div className="absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-400/14" />
                    <div className="relative flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      <span>Payment session</span>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-200 dark:bg-emerald-100 dark:text-blue-800">Paid</span>
                    </div>
                    <div className="relative mt-8 rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-5 dark:border-slate-950/10 dark:bg-slate-950/[0.04]">
                      <p className="text-sm text-slate-400 dark:text-slate-500">Global invoice</p>
                      <p className="mt-3 text-5xl font-black tracking-[-0.06em]">10.00 SOL</p>
                      <div className="mt-5 h-2 rounded-full bg-white/10 dark:bg-slate-950/10">
                        <div className="h-full w-[99.7%] rounded-full bg-gradient-to-r from-blue-400 to-cyan-300" />
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-white/[0.07] p-4 dark:bg-slate-950/[0.05]">
                          <p className="text-slate-400 dark:text-slate-500">Fee</p>
                          <p className="mt-1 font-black">0.03 SOL</p>
                        </div>
                        <div className="rounded-2xl bg-emerald-300 p-4 text-slate-950">
                          <p className="text-emerald-900/70">Net</p>
                          <p className="mt-1 font-black">9.97 SOL</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm dark:border-slate-950/10 dark:bg-slate-950/[0.035]">
                      <div className="flex items-center gap-2 font-black">
                        <Webhook className="h-4 w-4 text-emerald-300 dark:text-blue-700" />
                        payment.success webhook queued
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section data-track-section="workflow-value" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mx-auto mb-12 max-w-3xl text-center">
              <span className="landing-label">Why teams choose Trezalink</span>
              <h2 className="landing-display mt-3">Start with a link. Scale into an operating layer.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                The same payment foundation can support a solo invoice, a recurring customer workflow,
                or a developer-led checkout built into your product.
              </p>
            </ScrollReveal>
            <div className="grid gap-5 md:grid-cols-3">
              {VALUE_POINTS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={index * 70} className="landing-card h-full rounded-[1.7rem] p-6">
                    <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.copy}</p>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section data-track-section="audiences" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mb-12 max-w-3xl">
              <span className="landing-label">Use cases</span>
              <h2 className="landing-display mt-3">Built for payment motions across modern teams.</h2>
            </ScrollReveal>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((item, index) => {
                const Icon = item.icon;
                return (
                  <ScrollReveal key={item.title} delay={index * 60} className="landing-card group h-full rounded-[1.7rem] p-6">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition-transform group-hover:-translate-y-1 dark:bg-blue-400/10 dark:text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.desc}</p>
                    <ul className="mt-6 space-y-3">
                      {item.points.map((point) => (
                        <li key={point} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <Check className="h-4 w-4 text-emerald-600 dark:text-cyan-300" />
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

        <section data-track-section="capabilities" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="landing-showcase rounded-[2rem] p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
                <ScrollReveal>
                  <span className="landing-label">Capability proof</span>
                  <h2 className="landing-display mt-3">The product pieces behind each workflow.</h2>
                  <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                    Keep checkout lightweight while giving product, finance, and developer teams the
                    visibility needed to operate Solana payments with confidence.
                  </p>
                  <TrackingLink
                    href="/developer"
                    eventName="cta_click"
                    eventData={{ placement: "use_cases_mid_docs" }}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                  >
                    Explore developer docs
                    <ArrowUpRight className="h-4 w-4" />
                  </TrackingLink>
                </ScrollReveal>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CAPABILITIES.map((item, index) => {
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

        <section data-track-section="use-cases-faq" className="landing-section relative py-20">
          <div className="mx-auto max-w-4xl px-6">
            <ScrollReveal className="mb-10 text-center">
              <span className="landing-label">Use cases FAQ</span>
              <h2 className="landing-display mt-3">Answers before you route payments through Trezalink.</h2>
            </ScrollReveal>
            <div className="space-y-3">
              {FAQS.map((item, index) => (
                <ScrollReveal key={item.key} delay={index * 45}>
                  <details data-faq-item={item.key} className="landing-card group rounded-[1.35rem] p-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <span className="text-left font-black text-slate-950 dark:text-white">{item.q}</span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90 dark:text-slate-500" />
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
                Start simple, automate later
              </span>
              <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
                Launch the payment workflow that fits today and can scale tomorrow.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Use payment links first, then add checkout API and webhooks as your product workflow matures.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "use_cases_final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Open merchant account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink
                  href="/docs/quickstart"
                  eventName="cta_click"
                  eventData={{ placement: "use_cases_final_secondary_quickstart" }}
                  className="landing-btn-secondary px-10 py-4"
                >
                  Read quickstart
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
          eventData={{ placement: "use_cases_mobile_sticky" }}
          className="landing-btn-primary w-full shadow-lg shadow-blue-950/20"
        >
          <WalletCards className="h-4 w-4" />
          Open merchant account
        </TrackingLink>
      </div>

      <footer className="relative z-10 border-t border-slate-200/70 bg-[#f4f7ff] dark:border-white/10 dark:bg-[#060818]">
        <Footer />
      </footer>
    </div>
  );
}
