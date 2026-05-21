import { Blocks, CheckCircle2, FileJson, KeyRound, ShieldCheck, Terminal, Webhook } from "lucide-react";

const checkoutExample = `curl -X POST https://trezalink.com/api/v1/checkout \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "orderId": "INV-2026-001",
    "amount": 0.5,
    "currency": "SOL",
    "customerEmail": "buyer@example.com",
    "customerReference": "CUST-REF-001",
    "customerName": "Avery Stone",
    "notes": "Priority support customer",
    "successUrl": "https://merchant.com/success",
    "cancelUrl": "https://merchant.com/cancel"
  }'`;

const responseExample = `{
  "message": "Checkout session created successfully",
  "transactionId": "txn_7K29...",
  "checkoutUrl": "https://trezalink.com/pay/txn_7K29...",
  "expiresAt": "2026-05-21T10:00:00.000Z"
}`;

const errorExample = `{
  "error": {
    "code": "CHECKOUT_VALIDATION_FAILED",
    "message": "Request payload failed validation.",
    "requestId": "req_0f8f7a7b-...",
    "retryable": false,
    "docsUrl": "/docs/error-reference#error-checkout_validation_failed",
    "details": {
      "amount": {
        "_errors": ["Amount must be a positive number"]
      }
    }
  }
}`;

const fields = [
  { name: "orderId", type: "string", requirement: "Required", description: "Unique merchant order reference for reconciliation." },
  { name: "amount", type: "number", requirement: "Required", description: "Payment amount in the selected currency." },
  { name: "currency", type: "string", requirement: "Required", description: "Currently optimized for SOL checkout settlement." },
  { name: "customerEmail", type: "string", requirement: "Optional", description: "Customer identifier for receipts and support lookup." },
  { name: "customerReference", type: "string", requirement: "Optional", description: "Merchant-defined customer reference for support and reconciliation." },
  { name: "customerName", type: "string", requirement: "Optional", description: "Display-friendly customer name for receipt and support context." },
  { name: "notes", type: "string", requirement: "Optional", description: "Free-form payment context note, capped for operational safety." },
  { name: "successUrl", type: "url", requirement: "Optional", description: "Redirect destination after successful payment." },
  { name: "cancelUrl", type: "url", requirement: "Optional", description: "Redirect destination when the checkout is cancelled." },
];

export function TabApiDocs() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: FileJson,
            label: "Checkout API",
            value: "POST /api/v1/checkout",
            detail: "Create hosted payment sessions from your backend.",
            tone: "blue",
          },
          {
            icon: KeyRound,
            label: "Authentication",
            value: "Bearer token",
            detail: "Every server request must include your production API key.",
            tone: "emerald",
          },
          {
            icon: Blocks,
            label: "Plugins",
            value: "Coming soon",
            detail: "Shopify and WooCommerce adapters are planned for merchant teams.",
            tone: "amber",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
            <item.icon
              className={`mb-4 h-5 w-5 ${
                item.tone === "emerald"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : item.tone === "amber"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-blue-600 dark:text-blue-400"
              }`}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className="mt-2 font-mono text-sm font-semibold text-slate-950 dark:text-white">{item.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
          <div className="border-b border-slate-200 p-5 dark:border-white/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Request Schema</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Hosted checkout session</h3>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                POST
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {fields.map((field) => (
              <div key={field.name} className="grid gap-3 p-5 md:grid-cols-[180px_1fr]">
                <div>
                  <code className="text-sm font-semibold text-blue-600 dark:text-blue-400">{field.name}</code>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                      {field.type}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${field.requirement === "Required" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300" : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400"}`}>
                      {field.requirement}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{field.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-900 bg-[#0B0F17] p-5 text-white shadow-sm dark:border-white/10">
            <div className="mb-4 flex items-center gap-2 text-slate-400">
              <Terminal className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-[0.18em]">cURL Example</h4>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-black/30 p-4 text-[11px] leading-relaxed text-slate-200">
              <code>{checkoutExample}</code>
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-[#0B0F17] p-5 text-white shadow-sm dark:border-white/10">
            <div className="mb-4 flex items-center gap-2 text-slate-400">
              <CheckCircle2 className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-[0.18em]">Success Response</h4>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-black/30 p-4 text-[11px] leading-relaxed text-emerald-200">
              <code>{responseExample}</code>
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-[#0B0F17] p-5 text-white shadow-sm dark:border-white/10">
            <div className="mb-4 flex items-center gap-2 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-[0.18em]">Error Contract</h4>
            </div>
            <pre className="overflow-x-auto rounded-xl bg-black/30 p-4 text-[11px] leading-relaxed text-amber-200">
              <code>{errorExample}</code>
            </pre>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="text-sm font-semibold text-blue-950 dark:text-blue-100">Server-side only</h4>
                <p className="mt-1 text-xs leading-relaxed text-blue-700 dark:text-blue-200">
                  Keep API keys in backend environment variables. Webhook payloads should be verified with your signing secret before updating orders.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F17]">
            <div className="flex items-start gap-3">
              <Webhook className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-slate-950 dark:text-white">Webhook event</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Payment confirmations are delivered as webhook events so your system can reconcile orders even when customers close the browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
