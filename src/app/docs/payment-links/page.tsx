import DocsArticle from "@/components/docs/DocsArticle";

export default function DocsPaymentLinksPage() {
  return (
    <DocsArticle
      slug="payment-links"
      title="Payment Links"
      description="No-code manual payment collection with hosted checkout."
      toc={[
        { id: "creation", label: "Creation flow" },
        { id: "order-id", label: "Order IDs" },
        { id: "operations", label: "Operations" },
      ]}
    >
      <h2 id="creation">Creation flow</h2>
      <p>From dashboard, create link with amount and optional buyer metadata. System creates PENDING transaction.</p>
      <h2 id="order-id">Order IDs</h2>
      <p>You can provide custom orderId or let system generate prefixed identifier. Duplicate protection applies per merchant.</p>
      <h2 id="operations">Operations</h2>
      <p>Links and related transactions are visible in payment and analytics tables for reconciliation.</p>
    </DocsArticle>
  );
}
