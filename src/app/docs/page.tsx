import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/landing/PageBackground";
import ScrollReveal from "@/components/landing/ScrollReveal";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Check,
  Code2,
  FileCheck,
  KeyRound,
  Link as LinkIcon,
  Radio,
  ReceiptText,
  RotateCcw,
  Server,
  ShieldCheck,
  Terminal,
  Wallet,
  Webhook,
  Zap,
} from "lucide-react";

const QUICKSTART_STEPS = [
  {
    icon: Wallet,
    title: "Complete merchant profile",
    desc: "Register, verify the account, and connect a Solana settlement wallet before accepting payments.",
  },
  {
    icon: KeyRound,
    title: "Create credentials",
    desc: "Use the developer dashboard to regenerate a live API key and webhook secret when needed.",
  },
  {
    icon: LinkIcon,
    title: "Collect payment",
    desc: "Create a no-code payment link or call the checkout API to generate a hosted payment URL.",
  },
  {
    icon: ReceiptText,
    title: "Reconcile records",
    desc: "Track transaction status, fee, net amount, payer wallet, and webhook delivery from the dashboard.",
  },
];

const DOC_SECTIONS = [
  { icon: BookOpen, title: "Quickstart", desc: "Merchant setup, wallet readiness, and first payment collection." },
  { icon: Terminal, title: "Checkout API", desc: "Bearer authentication, request body, response format, and error states." },
  { icon: Webhook, title: "Webhooks", desc: "payment.success payloads, X-Trezalink-Signature, and delivery logs." },
  { icon: FileCheck, title: "Payment Links", desc: "Manual link creation with unique order IDs and PENDING transactions." },
  { icon: ShieldCheck, title: "Security", desc: "Non-custodial settlement, key rotation, duplicate protection, and HMAC." },
  { icon: ReceiptText, title: "Reporting", desc: "Transaction tables, analytics, platform fees, and net settlement records." },
];

const CHECKOUT_FIELDS = [
  { field: "orderId", type: "string", note: "Required. Unique per merchant." },
  { field: "amount", type: "number", note: "Required. Must be positive." },
  { field: "currency", type: '"SOL"', note: "Required. SOL is supported today." },
  { field: "customerEmail", type: "email", note: "Optional customer reference." },
  { field: "successUrl", type: "url", note: "Optional successful payment redirect." },
  { field: "cancelUrl", type: "url", note: "Optional payer exit redirect." },
];

const STATUS_CODES = [
  { code: "201", label: "Checkout session created" },
  { code: "400", label: "Validation, missing wallet, or malformed URL" },
  { code: "401", label: "Missing, invalid, or inactive API key" },
  { code: "409", label: "Duplicate orderId for the merchant" },
  { code: "500", label: "Unexpected server error" },
];

const CHECKOUT_SNIPPET = `POST /api/v1/checkout
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "orderId": "INV-2026-001",
  "amount": 10,
  "currency": "SOL",
  "customerEmail": "buyer@example.com",
  "successUrl": "https://yourstore.com/success",
  "cancelUrl": "https://yourstore.com/cart"
}`;

const WEBHOOK_SNIPPET = `{
  "event": "payment.success",
  "data": {
    "orderId": "INV-2026-001",
    "transactionId": "txn_...",
    "grossAmount": 10,
    "platformFee": 0.03,
    "netAmount": 9.97,
    "currency": "SOL",
    "status": "PAID",
    "txSignature": "...",
    "paidAt": "2026-05-19T05:31:52.000Z"
  }
}`;

const OPERATIONS = [
  "Regenerate API keys from the developer console",
  "Regenerate webhook secrets with whsec_ prefix",
  "Inspect the latest 50 webhook delivery logs",
  "Filter payment and payment-link records by status",
  "Review gross amount, 0.3% fee, and net amount",
];

export default function DocumentationPage() {
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
                  <BookOpen className="w-3.5 h-3.5" />
                  Trezalink docs
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.08]">
                  <span className="gradient-text">Build, collect, and reconcile</span>
                  <br />
                  <span className="landing-heading">with wallet-direct payments</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl landing-body max-w-2xl mx-auto lg:mx-0">
                  Practical guides for using Trezalink as it exists in the app: payment links,
                  checkout API sessions, Solana settlement, webhook logs, and merchant reporting.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/developer" className="landing-btn-primary">
                    API reference
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/architecture" className="landing-btn-secondary">
                    System architecture
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal immediate delay={120} variant="right">
                <div className="landing-panel rounded-2xl p-6 md:p-8">
                  <div className="flex items-center justify-between pb-5 mb-6 border-b landing-border">
                    <div>
                      <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Documentation map</p>
                      <h2 className="mt-1 text-xl font-semibold landing-heading">From setup to reconciliation</h2>
                    </div>
                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {DOC_SECTIONS.map((section) => (
                      <div key={section.title} className="rounded-xl border landing-border bg-slate-50/80 dark:bg-white/[0.03] p-4">
                        <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-3" />
                        <h3 className="text-sm font-semibold landing-heading">{section.title}</h3>
                        <p className="mt-1 text-xs landing-body">{section.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="max-w-2xl mb-14">
              <span className="landing-label">Quickstart</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading">
                The shortest path to a paid transaction
              </h2>
              <p className="mt-4 landing-body">
                Trezalink can start as a dashboard workflow and grow into a backend integration
                without changing the checkout or settlement model.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-4 gap-4">
              {QUICKSTART_STEPS.map((step, index) => (
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
                <span className="landing-label">Checkout API</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Create hosted checkout sessions
                </h2>
                <p className="landing-body mb-8">
                  Use the live API key from your merchant account. A successful request creates a
                  PENDING transaction with source API and returns a `/pay/:id` checkout URL.
                </p>
                <div className="landing-panel rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-4 border-b landing-border">
                    <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold landing-heading">Request example</span>
                  </div>
                  <pre className="text-xs font-mono landing-muted bg-slate-100 dark:bg-black/40 p-5 overflow-x-auto">
                    {CHECKOUT_SNIPPET}
                  </pre>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-panel rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold landing-heading mb-6">Body fields</h3>
                <div className="space-y-4">
                  {CHECKOUT_FIELDS.map((field) => (
                    <div key={field.field} className="grid sm:grid-cols-[130px_100px_1fr] gap-2 border-b landing-border pb-4 last:border-0 last:pb-0">
                      <span className="text-sm font-mono text-blue-700 dark:text-blue-300">{field.field}</span>
                      <span className="text-sm landing-muted">{field.type}</span>
                      <span className="text-sm landing-body">{field.note}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <ScrollReveal variant="left">
                <span className="landing-label">Responses</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Know what to handle in production
                </h2>
                <p className="landing-body mb-8">
                  The checkout route returns clear HTTP states for validation, authentication,
                  merchant setup, duplicate order IDs, and successful session creation.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {STATUS_CODES.map((status) => (
                    <div key={status.code} className="landing-panel rounded-xl p-5">
                      <p className="text-2xl font-bold landing-heading">{status.code}</p>
                      <p className="text-sm landing-body mt-2">{status.label}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal variant="right" delay={100} className="landing-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold landing-heading">Manual payment links</h3>
                  <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="landing-body mb-6">
                  Payment links create PENDING SOL transactions from the dashboard. Merchants can
                  supply an orderId or let Trezalink generate one with the `TZL-LINK-` prefix.
                </p>
                <div className="space-y-3">
                  {[
                    "Unique orderId check per merchant",
                    "Optional customer email",
                    "Hosted checkout at /pay/:transactionId",
                    "Visible in payment link and payment tables",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm landing-body">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border bg-slate-100/50 dark:bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-start">
              <ScrollReveal variant="left" className="landing-panel rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b landing-border">
                  <Webhook className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold landing-heading">payment.success payload</span>
                </div>
                <pre className="text-xs font-mono landing-muted bg-slate-100 dark:bg-black/40 p-5 overflow-x-auto">
                  {WEBHOOK_SNIPPET}
                </pre>
              </ScrollReveal>

              <ScrollReveal variant="right">
                <span className="landing-label">Webhooks</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Verify and inspect event delivery
                </h2>
                <p className="landing-body mb-8">
                  When a payment is confirmed, Trezalink posts a `payment.success` event to the
                  merchant webhook URL. If a webhook secret exists, the payload is signed with
                  `X-Trezalink-Signature`.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: ShieldCheck, title: "HMAC-SHA256", desc: "Signature is computed over the raw JSON payload." },
                    { icon: RotateCcw, title: "Secret rotation", desc: "Regenerate `whsec_` credentials from the app." },
                    { icon: Radio, title: "10s timeout", desc: "Webhook delivery records connection failures and timeouts." },
                    { icon: BadgeCheck, title: "Delivery logs", desc: "The latest 50 logs are available to the merchant." },
                  ].map((item) => (
                    <div key={item.title} className="landing-panel rounded-xl p-5">
                      <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-4" />
                      <h3 className="text-sm font-semibold landing-heading mb-2">{item.title}</h3>
                      <p className="text-xs landing-body">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section relative py-24 border-t landing-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal variant="left">
                <span className="landing-label">Operations</span>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight landing-heading mb-5">
                  Run the integration from the merchant console
                </h2>
                <p className="landing-body mb-8">
                  Trezalink documentation mirrors the product surface, so developers and operators
                  can debug the same payment state without separate tooling.
                </p>
                <div className="space-y-3">
                  {OPERATIONS.map((item) => (
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
                    <p className="text-xs landing-subtle uppercase tracking-wider font-semibold">Settlement math</p>
                    <h3 className="text-lg font-semibold landing-heading">10 SOL example</h3>
                  </div>
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Gross amount", value: "10.00 SOL" },
                    { label: "Platform fee", value: "0.03 SOL" },
                    { label: "Net amount", value: "9.97 SOL" },
                    { label: "Final status", value: "PAID" },
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
              <span className="landing-label">Next step</span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight landing-heading mb-5">
                Pair the docs with the API reference
              </h2>
              <p className="landing-body text-lg max-w-xl mx-auto mb-10">
                Use this documentation for product behavior, then jump into the developer page
                when you need endpoint details and request examples.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/developer" className="landing-btn-primary px-10 py-4">
                  Open developer page
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/register" className="landing-btn-secondary px-10 py-4">
                  Create merchant account
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
