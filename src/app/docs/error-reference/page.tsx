import DocsArticle from "@/components/docs/DocsArticle";

const ERROR_GROUPS = [
  {
    heading: "Checkout",
    items: [
      { id: "error-auth_missing_bearer_token", code: "AUTH_MISSING_BEARER_TOKEN", status: 401, action: "Send `Authorization: Bearer <API_KEY>` from backend." },
      { id: "error-auth_invalid_api_key", code: "AUTH_INVALID_API_KEY", status: 401, action: "Regenerate API key and verify account active state." },
      { id: "error-merchant_wallet_not_linked", code: "MERCHANT_WALLET_NOT_LINKED", status: 400, action: "Link settlement wallet before creating checkout session." },
      { id: "error-checkout_validation_failed", code: "CHECKOUT_VALIDATION_FAILED", status: 400, action: "Inspect `error.details` and fix payload fields." },
      { id: "error-checkout_duplicate_order_id", code: "CHECKOUT_DUPLICATE_ORDER_ID", status: 409, action: "Use unique orderId per merchant." },
      { id: "error-maintenance_mode_active", code: "MAINTENANCE_MODE_ACTIVE", status: 503, action: "Respect `Retry-After` and retry after maintenance." },
      { id: "error-internal_server_error", code: "INTERNAL_SERVER_ERROR", status: 500, action: "Retry if safe and share requestId with support." },
    ],
  },
  {
    heading: "Auth",
    items: [
      { id: "error-auth_missing_required_fields", code: "AUTH_MISSING_REQUIRED_FIELDS", status: 400, action: "Provide all required payload fields for the auth endpoint." },
      { id: "error-auth_invalid_credentials", code: "AUTH_INVALID_CREDENTIALS", status: 401, action: "Re-check email/password pair and try again." },
      { id: "error-auth_email_not_verified", code: "AUTH_EMAIL_NOT_VERIFIED", status: 403, action: "Verify account email before login." },
      { id: "error-auth_profile_setup_required", code: "AUTH_PROFILE_SETUP_REQUIRED", status: 403, action: "Complete profile setup before password login." },
      { id: "error-auth_activation_token_missing", code: "AUTH_ACTIVATION_TOKEN_MISSING", status: 400, action: "Submit activation token in request payload." },
      { id: "error-auth_activation_token_invalid", code: "AUTH_ACTIVATION_TOKEN_INVALID", status: 400, action: "Request a new activation link and retry." },
      { id: "error-auth_wallet_signature_invalid", code: "AUTH_WALLET_SIGNATURE_INVALID", status: 401, action: "Re-sign challenge message from the same wallet." },
      { id: "error-auth_profile_email_conflict", code: "AUTH_PROFILE_EMAIL_CONFLICT", status: 409, action: "Use a different email address for this account." },
      { id: "error-auth_merchant_not_found", code: "AUTH_MERCHANT_NOT_FOUND", status: 404, action: "Confirm merchantId and account existence." },
      { id: "error-auth_email_already_verified", code: "AUTH_EMAIL_ALREADY_VERIFIED", status: 400, action: "Skip resend flow because verification is complete." },
    ],
  },
  {
    heading: "Merchant",
    items: [
      { id: "error-merchant_unauthorized", code: "MERCHANT_UNAUTHORIZED", status: 401, action: "Authenticate first and ensure auth-token cookie is valid." },
      { id: "error-merchant_export_validation_failed", code: "MERCHANT_EXPORT_VALIDATION_FAILED", status: 400, action: "Use valid export query values (`status`, `from`, `to`) with ISO date format." },
      { id: "error-merchant_invalid_action", code: "MERCHANT_INVALID_ACTION", status: 400, action: "Use supported action values (`link` or `unlink`)." },
      { id: "error-merchant_missing_crypto_proofs", code: "MERCHANT_MISSING_CRYPTO_PROOFS", status: 400, action: "Provide `publicKey`, `signature`, and `message` for wallet linking." },
      { id: "error-merchant_wallet_signature_invalid", code: "MERCHANT_WALLET_SIGNATURE_INVALID", status: 401, action: "Regenerate wallet signature and retry with matching key." },
      { id: "error-merchant_wallet_already_linked", code: "MERCHANT_WALLET_ALREADY_LINKED", status: 409, action: "Use a wallet not owned by another merchant account." },
    ],
  },
  {
    heading: "Internal Ops",
    items: [
      { id: "error-internal_confirmation_missing_fields", code: "INTERNAL_CONFIRMATION_MISSING_FIELDS", status: 400, action: "Send both `transactionId` and `signature` in confirmation payload." },
      { id: "error-internal_confirmation_rejected", code: "INTERNAL_CONFIRMATION_REJECTED", status: 400, action: "Inspect transaction state and signature validity before retrying confirmation." },
      { id: "error-internal_rpc_telemetry_invalid_payload", code: "INTERNAL_RPC_TELEMETRY_INVALID_PAYLOAD", status: 400, action: "Include `operation`, `endpoint`, and `primaryEndpoint` when sending telemetry events." },
      { id: "error-internal_cron_unauthorized", code: "INTERNAL_CRON_UNAUTHORIZED", status: 401, action: "Pass valid cron secret via `x-cron-secret` or `Authorization: Bearer <secret>`." },
    ],
  },
] as const;

const TOC = ERROR_GROUPS.map((group) => ({ id: `group-${group.heading.toLowerCase()}`, label: group.heading }));

function statusTone(status: number) {
  if (status >= 500) return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
  if (status === 409 || status === 403) return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
}

export default function DocsErrorReferencePage() {
  return (
    <DocsArticle
      slug="error-reference"
      title="Error Reference"
      description="Machine-readable API error codes and diagnostics contract for checkout, auth, and merchant endpoints."
      toc={TOC}
    >
      <p>
        Error responses follow one contract: <code>error.code</code>, <code>message</code>, <code>requestId</code>, <code>retryable</code>,
        <code>docsUrl</code>, and optional <code>details</code>.
      </p>
      <p>
        Use <code>error.code</code> as the primary integration key in your backend logic, then map <code>retryable</code> and HTTP status to
        retry/alert behavior.
      </p>
      <p>
        Diagnostics flow: log <code>requestId</code> on every failed request, branch retry behavior using <code>retryable</code>, and surface
        <code>docsUrl</code> in internal tooling so operators can jump directly to the relevant error anchor.
      </p>

      {ERROR_GROUPS.map((group) => (
        <section key={group.heading} id={`group-${group.heading.toLowerCase()}`}>
          <h2>{group.heading}</h2>
          <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="hidden md:grid md:grid-cols-[1.1fr_90px_1.6fr] bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:bg-white/[0.04] dark:text-slate-300">
              <span>Error code</span>
              <span>Status</span>
              <span>Recommended action</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {group.items.map((item) => (
                <article key={item.code} id={item.id} className="grid gap-2 px-4 py-4 md:grid-cols-[1.1fr_90px_1.6fr] md:items-start">
                  <div>
                    <p className="font-mono text-[13px] text-blue-700 dark:text-blue-300">{item.code}</p>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(item.status)}`}>
                      HTTP {item.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">{item.action}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}
    </DocsArticle>
  );
}
