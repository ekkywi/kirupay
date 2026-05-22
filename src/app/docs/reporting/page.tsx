import type { Metadata } from "next";
import DocsArticle from "@/components/docs/DocsArticle";

export const metadata: Metadata = {
  title: "Docs Reporting",
};

export default function DocsReportingPage() {
  return (
    <DocsArticle
      slug="reporting"
      title="Reporting"
      description="Track transaction outcomes, fee math, and operational health."
      toc={[
        { id: "transaction-metrics", label: "Transaction metrics" },
        { id: "fee-model", label: "Fee model" },
        { id: "reconciliation-export", label: "Reconciliation export" },
        { id: "ops-health", label: "Operational health" },
      ]}
    >
      <h2 id="transaction-metrics">Transaction metrics</h2>
      <p>Dashboard includes payment status distribution, volumes, and merchant-level trends.</p>
      <h2 id="fee-model">Fee model</h2>
      <p>Platform fee is calculated at 0.3%; net settlement is exposed on transaction records.</p>
      <h2 id="reconciliation-export">Reconciliation export</h2>
      <p>
        Finance teams can export reconciliation-ready CSV from the Payments page. The export is designed for ledger matching
        and ERP/spreadsheet ingest with raw decimal values (no localized number formatting).
      </p>
      <p>
        Default export filter is <code>status=PAID</code> for the last 30 days based on <code>createdAt</code>. If URL filters
        are present (<code>status</code>, <code>from</code>, <code>to</code>), export follows those same filters.
      </p>
      <p>
        CSV columns are fixed: <code>transactionId</code>, <code>merchantId</code>, <code>orderId</code>, <code>status</code>,
        <code>currency</code>, <code>grossAmount</code>, <code>feeAmount</code>, <code>netAmount</code>, <code>txSignature</code>,
        <code>source</code>, <code>buyerWallet</code>, <code>customerEmail</code>, <code>createdAtUtc</code>, <code>updatedAtUtc</code>.
      </p>
      <p>
        All timestamps are serialized in UTC ISO format (<code>toISOString()</code>) to keep reconciliation stable across timezones.
      </p>
      <h2 id="ops-health">Operational health</h2>
      <p>Use maintenance RPC Health and public Status page to correlate integration behavior with platform conditions.</p>
      <p>
        Internal operators can inspect metrics-lite snapshots from <code>/api/internal/observability/metrics</code> for
        request volume, error-rate trend by endpoint, and average latency checks.
      </p>
    </DocsArticle>
  );
}