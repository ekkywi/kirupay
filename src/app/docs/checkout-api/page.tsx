import DocsArticle from "@/components/docs/DocsArticle";

const REQUEST_SNIPPET = `POST /api/v1/checkout\nAuthorization: Bearer <API_KEY>\nContent-Type: application/json\n\n{\n  "orderId": "INV-2026-001",\n  "amount": 10,\n  "currency": "SOL",\n  "customerEmail": "buyer@example.com",\n  "successUrl": "https://yourstore.com/success",\n  "cancelUrl": "https://yourstore.com/cart"\n}`;

const SUCCESS_SNIPPET = `{\n  "message": "Checkout session created successfully",\n  "transactionId": "txn_7K29...",\n  "checkoutUrl": "https://trezalink.com/pay/txn_7K29...",\n  "expiresAt": "2026-05-21T10:00:00.000Z"\n}`;

const ERROR_SNIPPET = `{\n  "error": {\n    "code": "CHECKOUT_VALIDATION_FAILED",\n    "message": "Request payload failed validation.",\n    "requestId": "req_0f8f7a7b-...",\n    "retryable": false,\n    "docsUrl": "/docs/error-reference#error-checkout_validation_failed",\n    "details": {\n      "amount": {\n        "_errors": ["Amount must be a positive number"]\n      }\n    }\n  }\n}`;

export default function DocsCheckoutApiPage() {
  return (
    <DocsArticle
      slug="checkout-api"
      title="Checkout API"
      description="Create hosted checkout sessions from backend systems using Bearer API keys."
      toc={[
        { id: "endpoint", label: "Endpoint" },
        { id: "request-body", label: "Request body" },
        { id: "responses", label: "Responses" },
        { id: "troubleshooting", label: "Troubleshooting" },
      ]}
    >
      <h2 id="endpoint">Endpoint</h2>
      <p><code>POST /api/v1/checkout</code> creates a PENDING transaction and returns checkout URL.</p>
      <pre><code>{REQUEST_SNIPPET}</code></pre>
      <h2 id="request-body">Request body</h2>
      <ul>
        <li><code>orderId</code>: required, unique per merchant.</li>
        <li><code>amount</code>: required, positive number.</li>
        <li><code>currency</code>: required, currently only <code>SOL</code>.</li>
        <li><code>customerEmail</code>, <code>successUrl</code>, <code>cancelUrl</code>: optional.</li>
      </ul>
      <h2 id="responses">Responses</h2>
      <p>Success returns <code>201</code>. Errors return structured payload with <code>error.code</code> and diagnostics.</p>
      <h3>Success 201</h3>
      <pre><code>{SUCCESS_SNIPPET}</code></pre>
      <h3>Error contract</h3>
      <pre><code>{ERROR_SNIPPET}</code></pre>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <ul>
        <li>Log <code>requestId</code> in your backend logs to correlate failed calls.</li>
        <li>Use <code>retryable=true</code> as machine signal for safe retry behavior.</li>
        <li>Open <code>docsUrl</code> to jump directly to the error reference anchor.</li>
        <li>For maintenance responses (<code>503</code>), respect <code>Retry-After</code> before retrying.</li>
      </ul>
    </DocsArticle>
  );
}
