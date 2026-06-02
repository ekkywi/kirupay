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
  Check,
  Code2,
  Copy,
  FileCheck,
  Fingerprint,
  KeyRound,
  Link as LinkIcon,
  Radio,
  RotateCcw,
  Server,
  Shield,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Developer",
  description:
    "Create Solana checkout sessions with Trezalink's checkout API, Bearer API key authentication, signed webhooks, and wallet-direct settlement.",
};

const API_CAPABILITIES = [
  { value: "POST", label: "/api/v1/checkout" },
  { value: "Bearer", label: "API key authentication" },
  { value: "SOL + USDC", label: "Supported settlement assets" },
  { value: "24h", label: "Checkout session window" },
];

const INTEGRATION_STEPS = [
  {
    icon: Wallet,
    title: "Connect settlement wallet",
    desc: "Complete merchant setup and add the wallet where successful payments should settle.",
  },
  {
    icon: KeyRound,
    title: "Generate API key",
    desc: "Use the developer dashboard to create or rotate the credential used by your backend.",
  },
  {
    icon: LinkIcon,
    title: "Create checkout session",
    desc: "Send amount, currency, orderId, and optional redirect URLs to receive a hosted checkout URL.",
  },
  {
    icon: Radio,
    title: "Listen for updates",
    desc: "Configure a webhook endpoint and inspect delivery logs when your backend needs payment status.",
  },
];

const REQUEST_BODY = [
  { field: "orderId", type: "string", required: true, note: "Unique merchant order reference" },
  { field: "amount", type: "number", required: true, note: "Positive amount based on selected currency" },
  { field: "currency", type: '"SOL" | "USDC"', required: true, note: "USDC support is controlled by network configuration" },
  { field: "customerEmail", type: "string", required: false, note: "Optional receipt and reconciliation data" },
  { field: "customerReference", type: "string", required: false, note: "Optional customer lookup reference for support teams" },
  { field: "customerName", type: "string", required: false, note: "Optional display name for customer context" },
  { field: "notes", type: "string", required: false, note: "Optional internal note with bounded length" },
  { field: "successUrl", type: "url", required: false, note: "Optional redirect after payment" },
  { field: "cancelUrl", type: "url", required: false, note: "Optional redirect when payer exits" },
];

const SECURITY_CONTROLS = [
  { icon: Shield, title: "No custody boundary", desc: "The payer authorizes from their wallet and settlement goes to the merchant wallet." },
  { icon: Fingerprint, title: "Bearer credentials", desc: "Checkout creation requires an active merchant API key in the Authorization header." },
  { icon: FileCheck, title: "Duplicate protection", desc: "The API rejects reused orderId values for the same merchant." },
  { icon: RotateCcw, title: "Key rotation", desc: "Credentials can be regenerated from the merchant developer console." },
];

const CHECKOUT_SNIPPET = `curl -X POST https://trezalink.com/api/v1/checkout \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -d '{
    "orderId": "INV-2026-001",
    "amount": 10,
    "currency": "SOL",
    "customerEmail": "buyer@example.com",
    "customerReference": "CUST-REF-001",
    "customerName": "Avery Stone",
    "notes": "Priority support customer",
    "successUrl": "https://yourstore.com/success",
    "cancelUrl": "https://yourstore.com/cart"
  }'`;

const RESPONSE_SNIPPET = `{
  "message": "Checkout session created successfully",
  "transactionId": "txn_...",
  "checkoutUrl": "https://trezalink.com/pay/txn_...",
  "expiresAt": "2026-05-20T04:26:32.000Z"
}`;

export default function DeveloperPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden selection:bg-blue-400/25">
      <PageBackground />
      <LandingAnalytics />

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <Navbar />
      </div>

      <main>
        <section data-track-section="developer-hero" className="landing-section relative min-h-screen pt-28 pb-16 md:pt-36">
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[0.94fr_1.06fr]">
              <ScrollReveal immediate className="text-center lg:text-left">
                <span className="landing-pill mb-6 inline-flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5" />
                  Developer portal
                </span>
                <h1 className="max-w-5xl text-5xl font-black leading-[0.96] tracking-[-0.065em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[5rem] dark:text-white">
                  Create Solana checkout from one API request.
                </h1>
                <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl lg:mx-0 dark:text-slate-300">
                  Integrate hosted checkout, merchant API keys, payment redirects, and webhook
                  status delivery while Trezalink keeps settlement wallet-direct.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  <TrackingLink
                    href="/register"
                    eventName="cta_click"
                    eventData={{ placement: "developer_hero_primary" }}
                    className="landing-btn-primary"
                  >
                    Get API key
                    <ArrowRight className="h-4 w-4" />
                  </TrackingLink>
                  <TrackingLink
                    href="/docs/checkout-api"
                    eventName="cta_click"
                    eventData={{ placement: "developer_hero_docs" }}
                    className="landing-btn-secondary"
                  >
                    Read checkout docs
                    <ArrowUpRight className="h-4 w-4" />
                  </TrackingLink>
                </div>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right" className="landing-showcase overflow-hidden rounded-[2rem] p-5 sm:p-6">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/76 shadow-2xl shadow-slate-900/8 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/30">
                  <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Code2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-black text-slate-950 dark:text-white">Create checkout</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">POST /api/v1/checkout</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-blue-800 dark:bg-emerald-300/10 dark:text-cyan-200">curl</span>
                  </div>
                  <pre className="overflow-x-auto bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-100 dark:bg-black/55">
                    {CHECKOUT_SNIPPET}
                  </pre>
                </div>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {API_CAPABILITIES.map((capability, index) => (
                <ScrollReveal key={capability.label} delay={index * 70} className="landing-card h-full rounded-[1.4rem] px-5 py-4">
                  <p className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl dark:text-white">{capability.value}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{capability.label}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section data-track-section="integration-path" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal className="mb-14 max-w-3xl">
              <span className="landing-label">Integration path</span>
              <h2 className="landing-display mt-3">Ship checkout without owning payment infrastructure.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                Start from the merchant dashboard, move checkout creation to your backend,
                and use webhook logs when your application needs reliable payment state.
              </p>
            </ScrollReveal>

            <div className="grid gap-4 md:grid-cols-4">
              {INTEGRATION_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <ScrollReveal key={step.title} delay={index * 90} className="landing-card group relative h-full rounded-[1.7rem] p-6">
                    <span className="absolute right-5 top-5 text-xs font-black text-slate-300 dark:text-slate-600">0{index + 1}</span>
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 transition-transform group-hover:-translate-y-1 dark:bg-blue-400/10 dark:text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.desc}</p>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section data-track-section="checkout-endpoint" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <ScrollReveal>
                <span className="landing-label">Endpoint</span>
                <h2 className="landing-display mt-3">Checkout API shaped for backend services.</h2>
                <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                  The production route validates bearer credentials, merchant wallet readiness,
                  unique order IDs, positive currency amounts, and optional redirect URLs.
                </p>
                <div className="landing-showcase mt-8 rounded-[2rem] p-5 sm:p-6">
                  <div className="rounded-[1.5rem] border border-white/70 bg-white/76 p-6 dark:border-white/10 dark:bg-slate-950/62">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Server className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-slate-400">Route</p>
                        <p className="mt-1 font-mono text-sm font-black text-slate-950 dark:text-white">POST /api/v1/checkout</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["201 created", "400 validation error", "401 invalid key", "409 duplicate order"].map((status) => (
                        <div key={status} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs font-black text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
                          {status}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-card rounded-[1.7rem] p-6 md:p-8">
                <h3 className="mb-6 text-xl font-black tracking-tight text-slate-950 dark:text-white">Request body</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-white/10">
                        <th className="pb-3 pr-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Field</th>
                        <th className="pb-3 pr-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Type</th>
                        <th className="pb-3 pr-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Required</th>
                        <th className="pb-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REQUEST_BODY.map((row) => (
                        <tr key={row.field} className="border-b border-slate-200/70 last:border-0 dark:border-white/10">
                          <td className="py-3 pr-4 font-mono text-xs font-black text-blue-700 dark:text-cyan-300">{row.field}</td>
                          <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{row.type}</td>
                          <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{row.required ? "Yes" : "No"}</td>
                          <td className="py-3 leading-6 text-slate-600 dark:text-slate-400">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="response-security" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-start gap-10 lg:grid-cols-2">
              <ScrollReveal className="landing-showcase overflow-hidden rounded-[2rem] p-5 sm:p-6">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/76 dark:border-white/10 dark:bg-slate-950/62">
                  <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-cyan-300" />
                      <span className="text-sm font-black text-slate-950 dark:text-white">Success response</span>
                    </div>
                    <Copy className="h-4 w-4 text-slate-400" />
                  </div>
                  <pre className="overflow-x-auto bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-100 dark:bg-black/55">
                    {RESPONSE_SNIPPET}
                  </pre>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right">
                <span className="landing-label">Security model</span>
                <h2 className="landing-display mt-3">Guardrails that map to the merchant dashboard.</h2>
                <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Developer tooling is tied to the same merchant profile used by wallet setup,
                  webhook configuration, transaction history, and payment link operations.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {SECURITY_CONTROLS.map((control) => {
                    const Icon = control.icon;
                    return (
                      <div key={control.title} className="landing-card rounded-[1.25rem] p-5">
                        <Icon className="mb-4 h-5 w-5 text-emerald-600 dark:text-cyan-300" />
                        <h3 className="text-sm font-black text-slate-950 dark:text-white">{control.title}</h3>
                        <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">{control.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="webhooks" className="landing-section relative py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
              <ScrollReveal>
                <span className="landing-label">Webhooks</span>
                <h2 className="landing-display mt-3">Keep your backend synchronized after checkout.</h2>
                <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Configure webhook URLs from the merchant console, rotate webhook secrets,
                  and inspect delivery logs when a payment status update needs tracing.
                </p>
                <div className="mt-8 space-y-3">
                  {[
                    "HMAC-signed payload verification",
                    "Delivery logs in the developer dashboard",
                    "Regeneratable webhook secret",
                    "Dashboard state shared with payment records",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-cyan-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-showcase rounded-[2rem] p-5 sm:p-6">
                <div className="rounded-[1.5rem] border border-white/70 bg-white/76 p-6 dark:border-white/10 dark:bg-slate-950/62">
                  <div className="mb-6 flex items-center justify-between border-b border-slate-200/70 pb-5 dark:border-white/10">
                    <div>
                      <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-cyan-300">Webhook event</p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">payment.updated</h3>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-emerald-300/10 dark:text-cyan-200">
                      <Zap className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Source", value: "Trezalink webhook worker" },
                      { label: "Signature", value: "HMAC-SHA256" },
                      { label: "Destination", value: "Merchant endpoint" },
                      { label: "Visible in app", value: "Webhook logs tab" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-4 border-b border-slate-200/70 pb-4 last:border-0 last:pb-0 dark:border-white/10">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
                        <span className="text-right text-sm font-black text-slate-950 dark:text-white">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section data-track-section="final-cta" className="landing-section relative py-24 pb-32 md:pb-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <ScrollReveal variant="scale" className="landing-final rounded-[2.4rem] px-6 py-16 sm:px-10 md:py-20">
              <span className="landing-pill inline-flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5" />
                Start building
              </span>
              <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
                From payment link to full API integration.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Use payment links for manual collection today, then connect the checkout API and webhooks
                when your product needs automated payment operations.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <TrackingLink
                  href="/register"
                  eventName="cta_click"
                  eventData={{ placement: "developer_final_primary" }}
                  className="landing-btn-primary px-10 py-4"
                >
                  Create merchant account
                  <ArrowRight className="h-4 w-4" />
                </TrackingLink>
                <TrackingLink
                  href="/architecture"
                  eventName="cta_click"
                  eventData={{ placement: "developer_final_architecture" }}
                  className="landing-btn-secondary px-10 py-4"
                >
                  View architecture
                </TrackingLink>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200/70 bg-[#f4f7ff] dark:border-white/10 dark:bg-[#060818]">
        <Footer />
      </footer>
    </div>
  );
}
