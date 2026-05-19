import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  Check,
  CircleDot,
  Code2,
  CreditCard,
  FileCheck,
  Flag,
  Globe2,
  KeyRound,
  Layers3,
  Link as LinkIcon,
  ListChecks,
  Lock,
  Network,
  Radar,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Wallet,
  Webhook,
} from "lucide-react";

const ROADMAP_STATS = [
  { value: "Live", label: "Solana SOL checkout" },
  { value: "0.3%", label: "Platform fee model" },
  { value: "API", label: "Checkout automation" },
  { value: "HMAC", label: "Webhook verification" },
];

const CURRENT_FOUNDATION = [
  { icon: Wallet, title: "Merchant onboarding", desc: "Registration, activation, profile completion, and settlement wallet setup." },
  { icon: LinkIcon, title: "Payment links", desc: "Manual SOL payment links with unique order IDs and hosted checkout pages." },
  { icon: Code2, title: "Checkout API", desc: "Bearer-key endpoint for creating checkout sessions from backend systems." },
  { icon: Webhook, title: "Webhook logs", desc: "Signed payment.success delivery with response tracking for merchants." },
  { icon: BarChart3, title: "Analytics dashboard", desc: "Transaction history, revenue views, payment sources, and merchant reporting." },
  { icon: ShieldCheck, title: "Admin oversight", desc: "Admin views for merchants, transactions, platform revenue, and activity." },
];

const ROADMAP_PHASES = [
  {
    status: "Live now",
    title: "Core merchant payment stack",
    desc: "The production foundation for wallet-direct SOL payments and merchant operations.",
    icon: BadgeCheck,
    items: [
      "Hosted checkout at /pay/:transactionId",
      "Payment links and API-created checkout sessions",
      "Merchant wallet settlement with 0.3% fee calculation",
      "Webhook secret rotation and delivery inspection",
    ],
  },
  {
    status: "Next",
    title: "Reliability and developer polish",
    desc: "Make integrations easier to operate, retry, and debug as transaction volume grows.",
    icon: Radar,
    items: [
      "Webhook retry controls and richer delivery status",
      "Improved API error reference and dashboard copy",
      "Better reconciliation exports for finance teams",
      "More complete integration examples for backend services",
    ],
  },
  {
    status: "Planned",
    title: "Merchant workflow expansion",
    desc: "Expand the tools around payments so teams can collect, review, and manage revenue faster.",
    icon: Layers3,
    items: [
      "Customer-facing receipt improvements",
      "Saved customer references and payment metadata",
      "Team-ready roles and access boundaries",
      "Notification settings for payment and webhook events",
    ],
  },
  {
    status: "Later",
    title: "Multi-asset and ecosystem reach",
    desc: "Broaden settlement options once the SOL payment path is stable and observable.",
    icon: Globe2,
    items: [
      "USDC SPL support evaluation",
      "Sandbox or test-mode separation",
      "Partner integration templates",
      "Advanced risk and compliance reporting",
    ],
  },
];

const PRIORITIES = [
  { icon: Lock, label: "Non-custodial by default" },
  { icon: RefreshCw, label: "Observable operational flows" },
  { icon: KeyRound, label: "Rotatable credentials" },
  { icon: FileCheck, label: "Auditable transaction records" },
  { icon: Network, label: "Solana-native settlement" },
  { icon: BellRing, label: "Actionable merchant alerts" },
];

const MILESTONE_ROWS = [
  { area: "Checkout", now: "Hosted SOL checkout", next: "Better receipts and redirects" },
  { area: "API", now: "Create checkout session", next: "Expanded examples and error docs" },
  { area: "Webhooks", now: "Signed payment.success", next: "Retry and delivery controls" },
  { area: "Dashboard", now: "Payments, analytics, settings", next: "Exports and workflow polish" },
  { area: "Assets", now: "SOL", next: "USDC SPL exploration" },
];

export default function RoadmapPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-500/20">
      <PageBackground />

      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section className="landing-section relative min-h-screen flex items-center pt-28 pb-16">
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-[1fr_0.95fr] gap-12 items-center">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-md border landing-border bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-6">
                  <Flag className="w-3.5 h-3.5" />
                  Product roadmap
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                  <span className="gradient-text">Where Trezalink is now</span>
                  <br />
                  <span className="landing-heading">and what gets built next</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                  A practical development roadmap for the application: strengthen the live SOL
                  payment foundation, improve developer operations, then expand merchant workflows.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/register" className="landing-btn-primary">
                    Start with current stack
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/docs" className="landing-btn-secondary">
                    Read docs
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right">
                <div className="landing-panel rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between pb-5 mb-6 border-b landing-border">
                    <div>
                      <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Roadmap principle</p>
                      <h2 className="mt-1 text-xl font-semibold landing-heading">Stability before breadth</h2>
                    </div>
                    <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-4">
                    {[
                      "Keep settlement wallet-direct and non-custodial.",
                      "Make every payment state observable in the dashboard.",
                      "Improve developer reliability before adding more payment assets.",
                      "Build merchant operations around real transaction records.",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-sm landing-body">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {ROADMAP_STATS.map((stat, index) => (
                <ScrollReveal key={stat.label} delay={index * 70} className="landing-panel rounded-xl px-5 py-4 h-full">
                  <p className="text-2xl md:text-3xl font-bold landing-heading">{stat.value}</p>
                  <p className="text-xs landing-subtle mt-0.5 font-medium">{stat.label}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-14">
              <span className="landing-label">Current foundation</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                What the app already supports
              </h2>
              <p className="mt-4 landing-body">
                The roadmap starts from the working product surface: merchant accounts, payment links,
                checkout API, webhook logs, analytics, and admin visibility.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURRENT_FOUNDATION.map((item, index) => (
                <ScrollReveal key={item.title} delay={index * 60} className="landing-panel rounded-2xl p-6 h-full">
                  <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-5" />
                  <h3 className="font-semibold landing-heading mb-2">{item.title}</h3>
                  <p className="text-sm landing-body">{item.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-14">
              <span className="landing-label">Development phases</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                Roadmap by product maturity
              </h2>
              <p className="mt-4 landing-body">
                These phases are intentionally outcome-based, so the team can prioritize reliability
                and merchant value without over-promising release dates.
              </p>
            </ScrollReveal>

            <div className="grid lg:grid-cols-4 gap-4">
              {ROADMAP_PHASES.map((phase, index) => (
                <ScrollReveal key={phase.title} delay={index * 90} className="landing-panel rounded-2xl p-6 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full border landing-border px-2.5 py-1 landing-muted">
                      {phase.status}
                    </span>
                    <phase.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold landing-heading mb-2">{phase.title}</h3>
                  <p className="text-sm landing-body mb-6">{phase.desc}</p>
                  <div className="space-y-3">
                    {phase.items.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CircleDot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs landing-body">{item}</p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
              <ScrollReveal variant="left">
                <span className="landing-label">Priorities</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Development themes that guide decisions
                </h2>
                <p className="landing-body mb-8">
                  New features should make Trezalink easier to trust, operate, debug, and reconcile
                  before expanding the surface area too quickly.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {PRIORITIES.map((priority) => (
                    <div key={priority.label} className="landing-panel rounded-xl p-5 flex items-center gap-3">
                      <priority.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <p className="text-sm font-semibold landing-heading">{priority.label}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-panel rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold landing-heading">Milestone view</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b landing-border">
                        <th className="pb-3 pr-4 landing-subtle font-semibold">Area</th>
                        <th className="pb-3 pr-4 landing-subtle font-semibold">Now</th>
                        <th className="pb-3 landing-subtle font-semibold">Next focus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MILESTONE_ROWS.map((row) => (
                        <tr key={row.area} className="border-b landing-border last:border-0">
                          <td className="py-4 pr-4 font-semibold landing-heading">{row.area}</td>
                          <td className="py-4 pr-4 landing-body">{row.now}</td>
                          <td className="py-4 landing-body">{row.next}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal variant="left" className="landing-panel rounded-2xl p-8">
                <div className="flex items-center justify-between pb-5 mb-5 border-b landing-border">
                  <div>
                    <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Asset roadmap</p>
                    <h3 className="text-lg font-semibold landing-heading">SOL first, USDC later</h3>
                  </div>
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="landing-body mb-6">
                  The current application supports SOL for checkout and settlement. USDC SPL is a
                  planned expansion once core reliability, logs, and reporting are stronger.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border landing-border bg-slate-50 dark:bg-white/[0.03] p-4">
                    <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Live</p>
                    <p className="mt-1 text-2xl font-bold landing-heading">SOL</p>
                  </div>
                  <div className="rounded-xl border landing-border bg-slate-50 dark:bg-white/[0.03] p-4">
                    <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Exploring</p>
                    <p className="mt-1 text-2xl font-bold landing-heading">USDC</p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right">
                <span className="landing-label">Feedback loop</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Roadmap follows real merchant operations
                </h2>
                <p className="landing-body mb-8">
                  The highest-value work is the work that reduces payment uncertainty: clearer
                  statuses, better logs, safer credentials, and reports finance teams can trust.
                </p>
                <Link href="/developer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Review developer capabilities
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16 md:px-16">
              <span className="landing-label">Build with us</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">
                Start on the live foundation today
              </h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">
                Trezalink already supports merchant onboarding, SOL checkout, API sessions,
                payment links, and webhook logs. The roadmap compounds from that base.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="landing-btn-primary px-10 py-4">
                  Create merchant account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/architecture" className="landing-btn-secondary px-10 py-4">
                  View architecture
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
