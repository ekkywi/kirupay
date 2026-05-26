import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
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
                  <Terminal className="w-3.5 h-3.5" />
                  Developer portal
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                  <span className="gradient-text">Create Solana checkout</span>
                  <br />
                  <span className="landing-heading">from one API request</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                  Integrate hosted checkout, merchant API keys, payment redirects, and webhook
                  status delivery while Trezalink keeps settlement wallet-direct.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/register" className="landing-btn-primary">
                    Get API key
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/docs" className="landing-btn-secondary">
                    Read docs
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right">
                <div className="landing-panel rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b landing-border">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold landing-heading">Create checkout</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider landing-subtle">curl</span>
                  </div>
                  <pre className="text-xs font-mono landing-muted bg-slate-100 dark:bg-black/40 p-5 overflow-x-auto">
                    {CHECKOUT_SNIPPET}
                  </pre>
                </div>
              </ScrollReveal>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {API_CAPABILITIES.map((capability, index) => (
                <ScrollReveal key={capability.label} delay={index * 70} className="landing-panel rounded-xl px-5 py-4 h-full">
                  <p className="text-2xl md:text-3xl font-bold landing-heading">{capability.value}</p>
                  <p className="text-xs landing-subtle mt-0.5 font-medium">{capability.label}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-14">
              <span className="landing-label">Integration path</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                Ship checkout without owning payment infrastructure
              </h2>
              <p className="mt-4 landing-body">
                Start from the merchant dashboard, move checkout creation to your backend,
                and use webhook logs when your application needs reliable payment state.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-4 gap-4">
              {INTEGRATION_STEPS.map((step, index) => (
                <ScrollReveal key={step.title} delay={index * 90} className="landing-panel rounded-2xl p-6 relative h-full">
                  <span className="absolute top-5 right-5 text-xs font-bold landing-subtle">0{index + 1}</span>
                  <step.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-6" />
                  <h3 className="font-semibold landing-heading mb-2">{step.title}</h3>
                  <p className="text-sm landing-body">{step.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
              <ScrollReveal variant="left">
                <span className="landing-label">Endpoint</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Checkout API shaped for backend services
                </h2>
                <p className="landing-body mb-8">
                  The production route validates bearer credentials, merchant wallet readiness,
                  unique order IDs, positive currency amounts, and optional redirect URLs.
                </p>
                <div className="landing-panel rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Route</p>
                      <p className="text-sm font-mono landing-heading">POST /api/v1/checkout</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {["201 created", "400 validation error", "401 invalid key", "409 duplicate order"].map((status) => (
                      <div key={status} className="rounded-lg border landing-border bg-slate-50 dark:bg-white/[0.03] px-3 py-2 text-xs font-semibold landing-muted">
                        {status}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-panel rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold landing-heading mb-6">Request body</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b landing-border">
                        <th className="pb-3 pr-4 landing-subtle font-semibold">Field</th>
                        <th className="pb-3 pr-4 landing-subtle font-semibold">Type</th>
                        <th className="pb-3 pr-4 landing-subtle font-semibold">Required</th>
                        <th className="pb-3 landing-subtle font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REQUEST_BODY.map((row) => (
                        <tr key={row.field} className="border-b landing-border last:border-0">
                          <td className="py-3 pr-4 font-mono text-blue-700 dark:text-blue-300">{row.field}</td>
                          <td className="py-3 pr-4 landing-muted">{row.type}</td>
                          <td className="py-3 pr-4 landing-muted">{row.required ? "Yes" : "No"}</td>
                          <td className="py-3 landing-body">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <ScrollReveal variant="left" className="landing-panel rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b landing-border">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold landing-heading">Success response</span>
                  </div>
                  <Copy className="w-4 h-4 landing-subtle" />
                </div>
                <pre className="text-xs font-mono landing-muted bg-slate-100 dark:bg-black/40 p-5 overflow-x-auto">
                  {RESPONSE_SNIPPET}
                </pre>
              </ScrollReveal>

              <ScrollReveal variant="right">
                <span className="landing-label">Security model</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Guardrails that map to the merchant dashboard
                </h2>
                <p className="landing-body mb-8">
                  Developer tooling is tied to the same merchant profile used by wallet setup,
                  webhook configuration, transaction history, and payment link operations.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {SECURITY_CONTROLS.map((control) => (
                    <div key={control.title} className="landing-panel rounded-xl p-5">
                      <control.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-4" />
                      <h3 className="text-sm font-semibold landing-heading mb-2">{control.title}</h3>
                      <p className="text-xs landing-body">{control.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-12 items-center">
              <ScrollReveal variant="left">
                <span className="landing-label">Webhooks</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Keep your backend synchronized after checkout
                </h2>
                <p className="landing-body mb-8">
                  Configure webhook URLs from the merchant console, rotate webhook secrets,
                  and inspect delivery logs when a payment status update needs tracing.
                </p>
                <div className="space-y-3">
                  {[
                    "HMAC-signed payload verification",
                    "Delivery logs in the developer dashboard",
                    "Regeneratable webhook secret",
                    "Dashboard state shared with payment records",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm landing-body">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-panel rounded-2xl p-8">
                <div className="flex items-center justify-between pb-5 mb-5 border-b landing-border">
                  <div>
                    <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Webhook event</p>
                    <h3 className="text-lg font-semibold landing-heading">payment.updated</h3>
                  </div>
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Source", value: "Trezalink webhook worker" },
                    { label: "Signature", value: "HMAC-SHA256" },
                    { label: "Destination", value: "Merchant endpoint" },
                    { label: "Visible in app", value: "Webhook logs tab" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 border-b landing-border pb-4 last:border-0 last:pb-0">
                      <span className="text-sm landing-muted">{row.label}</span>
                      <span className="text-sm font-medium landing-heading text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scale" className="landing-panel rounded-3xl px-8 py-16 md:px-16">
              <span className="landing-label">Start building</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">
                From payment link to full API integration
              </h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">
                Use payment links for manual collection today, then connect the checkout API and webhooks
                when your product needs automated payment operations.
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
