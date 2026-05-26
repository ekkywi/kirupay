import type { Metadata } from "next";
import ArchitecturePageContent from "@/components/architecture/ArchitecturePageContent";

export const metadata: Metadata = {
  title: "Architecture",
};

export default function ArchitecturePage() {
  return <ArchitecturePageContent />;
}
