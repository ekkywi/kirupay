import type { Metadata } from "next";
import DocsArticle from "@/components/docs/DocsArticle";

export const metadata: Metadata = {
  title: "Docs Quickstart",
};

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
        { id: "post-payment-checks", label: "Post-payment checks" },
        { id: "next-reads", label: "Next reads" },
      ]}
    >
      <h2 id="account-setup">Account setup</h2>
      <p>Register merchant account, activate email, then complete profile with settlement wallet information.</p>

      <h2 id="credentials">Credentials</h2>
      <p>Generate API key and webhook secret from developer dashboard. Keep credentials on backend only.</p>

      <h2 id="first-payment">First payment</h2>
      <p>Use payment links for manual collection or call checkout API for hosted <code>/pay/:transactionId</code> flow.</p>
      <p>
        For API integrations, always capture <code>error.requestId</code> on failures and follow
        <code>error.docsUrl</code> for code-specific remediation.
      </p>

      <h2 id="post-payment-checks">Post-payment checks</h2>
      <ul>
        <li><strong>Pricing and reconciliation:</strong> confirm gross, fee, and net values match ledger expectations.</li>
        <li><strong>Security boundary:</strong> verify wallet custody remains merchant-owned and webhook signatures are enforced.</li>
        <li><strong>Status monitoring:</strong> monitor public status during rollout and align retries with incident state.</li>
      </ul>

      <h2 id="next-reads">Next reads</h2>
      <ul>
        <li><a href="/docs/pricing">Pricing</a> for 0.3% fee math and worked examples.</li>
        <li><a href="/docs/security">Security</a> for shared responsibility and control boundaries.</li>
        <li><a href="/docs/status">Status</a> for uptime levels and incident response checklist.</li>
      </ul>
    </DocsArticle>
  );
}
