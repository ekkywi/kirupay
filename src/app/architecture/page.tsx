import type { Metadata } from "next";
import ArchitecturePageContent from "@/components/architecture/ArchitecturePageContent";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "Explore Trezalink architecture for non-custodial Solana payment links, checkout APIs, signed webhooks, wallet-direct settlement, and transparent platform fees.",
};

export default function ArchitecturePage() {
  return <ArchitecturePageContent />;
}
