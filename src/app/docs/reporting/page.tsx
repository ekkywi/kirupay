import DocsArticle from "@/components/docs/DocsArticle";

export default function DocsReportingPage() {
  return (
    <DocsArticle
      slug="reporting"
      title="Reporting"
      description="Track transaction outcomes, fee math, and operational health."
      toc={[
        { id: "transaction-metrics", label: "Transaction metrics" },
        { id: "fee-model", label: "Fee model" },
        { id: "ops-health", label: "Operational health" },
      ]}
    >
      <h2 id="transaction-metrics">Transaction metrics</h2>
      <p>Dashboard includes payment status distribution, volumes, and merchant-level trends.</p>
      <h2 id="fee-model">Fee model</h2>
      <p>Platform fee is calculated at 0.3%; net settlement is exposed on transaction records.</p>
      <h2 id="ops-health">Operational health</h2>
      <p>Use maintenance RPC Health and public Status page to correlate integration behavior with platform conditions.</p>
      <p>
        Internal operators can inspect metrics-lite snapshots from <code>/api/internal/observability/metrics</code> for
        request volume, error-rate trend by endpoint, and average latency checks.
      </p>
    </DocsArticle>
  );
}
