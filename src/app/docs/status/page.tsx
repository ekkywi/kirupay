import type { Metadata } from "next";
import DocsArticle from "@/components/docs/DocsArticle";

export const metadata: Metadata = {
  title: "Docs Status",
};

export default function DocsStatusPage() {
  return (
    <DocsArticle
      slug="status"
      title="Status"
      description="Use the public status page to monitor platform health and respond during incidents."
      toc={[
        { id: "levels", label: "Status levels" },
        { id: "incidents", label: "Active vs resolved incidents" },
        { id: "maintenance", label: "Maintenance behavior" },
        { id: "refresh", label: "Refresh cadence" },
        { id: "operator-checklist", label: "Operator checklist" },
      ]}
    >
      <h2 id="levels">Status levels</h2>
      <ul>
        <li><code>Operational</code>: all public components are healthy.</li>
        <li><code>Degraded</code>: partial performance issues or elevated latency.</li>
        <li><code>Partial Outage</code>: one or more components are unavailable.</li>
        <li><code>Major Outage</code>: broad service disruption.</li>
      </ul>

      <h2 id="incidents">Active vs resolved incidents</h2>
      <p>
        Active incidents represent ongoing operational events. Resolved incidents are recent incidents with
        completion timestamps and total duration for post-incident review.
      </p>

      <h2 id="maintenance">Maintenance behavior</h2>
      <p>
        During maintenance mode, payment creation can be paused temporarily. Integrations should treat maintenance
        responses as transient, respect retry guidance, and retry after the published maintenance window.
      </p>

      <h2 id="refresh">Refresh cadence</h2>
      <p>
        The public status page auto-refreshes every <code>45 seconds</code> to keep component and incident data current.
      </p>

      <h2 id="operator-checklist">What to do during degraded/outage states</h2>
      <ol>
        <li>Check affected components first and classify business impact.</li>
        <li>Pause non-critical retries and honor maintenance/retry guidance.</li>
        <li>Correlate with webhook and payments logs to isolate merchant impact.</li>
        <li>Resume normal retry behavior only after status returns to stable operation.</li>
      </ol>
    </DocsArticle>
  );
}
