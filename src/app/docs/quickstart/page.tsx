import DocsArticle from "@/components/docs/DocsArticle";

export default function DocsQuickstartPage() {
  return (
    <DocsArticle
      slug="quickstart"
      title="Quickstart"
      description="Set up your merchant account, connect settlement wallet, and collect your first payment."
      toc={[
        { id: "account-setup", label: "Account setup" },
        { id: "credentials", label: "Credentials" },
        { id: "first-payment", label: "First payment" },
      ]}
    >
      <h2 id="account-setup">Account setup</h2>
      <p>Register merchant account, activate email, then complete profile with settlement wallet information.</p>
      <h2 id="credentials">Credentials</h2>
      <p>Generate API key and webhook secret from developer dashboard. Keep credentials on backend only.</p>
      <h2 id="first-payment">First payment</h2>
      <p>Use payment links for manual collection or call checkout API for hosted `/pay/:transactionId` flow.</p>
      <p>
        For API integrations, always capture <code>error.requestId</code> on failures and follow
        <code>error.docsUrl</code> for code-specific remediation.
      </p>
    </DocsArticle>
  );
}
