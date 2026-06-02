import type { Metadata } from "next";
import PricingPageContent from "@/components/pricing/PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent 0.3% Solana payment pricing with direct wallet settlement, no setup fee, and no monthly subscription.",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
