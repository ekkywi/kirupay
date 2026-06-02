import type { Metadata } from "next";
import DocsArticle from "@/components/docs/DocsArticle";

export const metadata: Metadata = {
  title: "Docs Webhooks",
};

export default function DocsWebhooksPage() {
  return (
    <DocsArticle
      slug="webhooks"
      title="Webhooks"
      description="Receive and verify payment.success events with HMAC signatures."
      toc={[
        { id: "delivery", label: "Delivery model" },
        { id: "signature", label: "Signature verification" },
        { id: "observability", label: "Observability" },
      ]}
    >
      <h2 id="delivery">Delivery model</h2>
      <p>On successful payment confirmation, Trezalink posts a <code>payment.success</code> payload to merchant webhook URL.</p>
      <h2 id="signature">Signature verification</h2>
      <p>Validate <code>X-Trezalink-Signature</code> using HMAC-SHA256 over raw payload and your webhook secret.</p>
      <h2 id="observability">Observability</h2>
      <p>Webhook logs include status code, response snippet, and retry actions from maintenance recovery console.</p>
      <p>
        Align webhook retry policy with API diagnostics: retry only when upstream responses are transient, and retain
        correlated request identifiers in merchant-side logs for support escalation.
      </p>
    </DocsArticle>
  );
}