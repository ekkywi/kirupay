export type DocsNavItem = {
  slug: string;
  title: string;
  description: string;
  group: "Getting Started" | "Integrate" | "Operate";
};

export const DOCS_NAV: DocsNavItem[] = [
  { slug: "quickstart", title: "Quickstart", description: "From merchant setup to first paid transaction.", group: "Getting Started" },
  { slug: "pricing", title: "Pricing", description: "Single 0.3% fee model and settlement math.", group: "Getting Started" },
  { slug: "checkout-api", title: "Checkout API", description: "Create hosted checkout sessions from your backend.", group: "Integrate" },
  { slug: "error-reference", title: "Error Reference", description: "Machine-readable checkout error codes and actions.", group: "Integrate" },
  { slug: "webhooks", title: "Webhooks", description: "Verify signatures and observe delivery behavior.", group: "Integrate" },
  { slug: "payment-links", title: "Payment Links", description: "Manual no-code collection flow.", group: "Operate" },
  { slug: "security", title: "Security", description: "Key rotation, signing, and non-custodial controls.", group: "Operate" },
  { slug: "status", title: "Status", description: "Interpret uptime states and incident handling signals.", group: "Operate" },
  { slug: "reporting", title: "Reporting", description: "Transactions, fees, and reconciliation workflow.", group: "Operate" },
];

export function getDocsNavBySlug(slug: string) {
  return DOCS_NAV.find((item) => item.slug === slug) ?? null;
}

export function getPrevNextDocs(slug: string) {
  const index = DOCS_NAV.findIndex((item) => item.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: DOCS_NAV[index - 1] ?? null,
    next: DOCS_NAV[index + 1] ?? null,
  };
}
