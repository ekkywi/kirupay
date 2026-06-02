import type { Metadata } from "next";
import SecurityPageContent from "@/components/security/SecurityPageContent";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Understand Trezalink security boundaries: non-custodial settlement, webhook signature verification, API key rotation, and merchant-owned wallet custody.",
};

export default function SecurityPage() {
  return <SecurityPageContent />;
}
