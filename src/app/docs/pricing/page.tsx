import type { Metadata } from "next";
import DocsArticle from "@/components/docs/DocsArticle";

export const metadata: Metadata = {
  title: "Docs Pricing",
};

export default function DocsPricingPage() {
  return (
    <DocsArticle
      slug="pricing"
      title="Pricing"
      description="Understand the single-plan 0.3% fee model and settlement math before launch."
      toc={[
        { id: "model", label: "Pricing model" },
        { id: "math", label: "Gross, fee, and net" },
        { id: "examples", label: "Worked examples" },
        { id: "reconciliation", label: "Reconciliation notes" },
      ]}
    >
      <h2 id="model">Pricing model</h2>
      <p>
        Trezalink applies a single platform fee of <code>0.3%</code> per successful payment. There is no setup fee,
        no monthly platform subscription, and no minimum volume requirement.
      </p>

      <h2 id="math">Gross, fee, and net</h2>
      <p>
        Settlement records expose <code>grossAmount</code>, <code>feeAmount</code>, and <code>netAmount</code> so
        finance teams can reconcile every paid transaction deterministically.
      </p>
      <p>
        Formula: <code>feeAmount = grossAmount * 0.003</code>, <code>netAmount = grossAmount - feeAmount</code>.
      </p>

      <h2 id="examples">Worked examples</h2>
      <ul>
        <li><code>1.00 SOL</code> gross → <code>0.003 SOL</code> fee → <code>0.997 SOL</code> net.</li>
        <li><code>10.00 SOL</code> gross → <code>0.03 SOL</code> fee → <code>9.97 SOL</code> net.</li>
        <li><code>100.00 SOL</code> gross → <code>0.30 SOL</code> fee → <code>99.70 SOL</code> net.</li>
      </ul>
      <p>
        Network fees are separate from the platform fee and depend on wallet/network conditions.
      </p>

      <h2 id="reconciliation">Reconciliation notes</h2>
      <p>
        For CSV-based reconciliation, use the Reporting guide and align on fixed export fields,
        UTC timestamps, and paid-status filters.
      </p>
      <p>
        Continue to <a href="/docs/reporting">Reporting</a> for export schema and filtering behavior.
      </p>
    </DocsArticle>
  );
}
