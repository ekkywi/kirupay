import DocsArticle from "@/components/docs/DocsArticle";

export default function DocsSecurityPage() {
  return (
    <DocsArticle
      slug="security"
      title="Security"
      description="Core security principles for credentials, webhooks, and settlement."
      toc={[
        { id: "non-custodial", label: "Non-custodial" },
        { id: "credentials", label: "Credentials" },
        { id: "webhook-signing", label: "Webhook signing" },
      ]}
    >
      <h2 id="non-custodial">Non-custodial</h2>
      <p>Funds settle directly to merchant wallet; platform does not hold merchant assets.</p>
      <h2 id="credentials">Credentials</h2>
      <p>Rotate API keys and webhook secrets from dashboard, and store secrets only on backend services.</p>
      <h2 id="webhook-signing">Webhook signing</h2>
      <p>Webhook payloads are signed with HMAC-SHA256 to prevent tampering and replay ambiguity.</p>
    </DocsArticle>
  );
}
