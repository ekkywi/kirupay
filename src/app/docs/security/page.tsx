import type { Metadata } from "next";
import DocsArticle from "@/components/docs/DocsArticle";

export const metadata: Metadata = {
  title: "Docs Security",
};

export default function DocsSecurityPage() {
  return (
    <DocsArticle
      slug="security"
      title="Security"
      description="Current live security boundaries for custody, credentials, webhook integrity, and operator ownership."
      toc={[
        { id: "non-custodial", label: "Non-custodial boundary" },
        { id: "current-controls", label: "Current controls only" },
        { id: "shared-responsibility", label: "Shared responsibility" },
        { id: "webhook-signing", label: "Webhook signing" },
      ]}
    >
      <h2 id="non-custodial">Non-custodial boundary</h2>
      <p>
        Funds settle directly to merchant wallet. Trezalink does not store merchant private keys and does not operate a
        custodial balance layer for merchant assets.
      </p>

      <h2 id="current-controls">Current controls only</h2>
      <p>
        Security claims in product documentation reflect controls currently available in live flows: API key rotation,
        webhook signature validation support, duplicate order protection, and wallet-direct settlement boundaries.
      </p>

      <h2 id="shared-responsibility">Shared responsibility</h2>
      <ul>
        <li><strong>Merchant:</strong> store API keys securely, protect webhook secrets, and maintain wallet custody.</li>
        <li><strong>Trezalink:</strong> provide credential regeneration, webhook signing surface, and operational logs.</li>
        <li><strong>Integration teams:</strong> enforce signature verification and controlled retry policies in backend services.</li>
      </ul>

      <h2 id="webhook-signing">Webhook signing</h2>
      <p>
        Validate <code>X-Trezalink-Signature</code> with HMAC-SHA256 over raw payload using your webhook secret.
        Rotate secrets on schedule and re-validate endpoint handling after each rotation.
      </p>
    </DocsArticle>
  );
}
