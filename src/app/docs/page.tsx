import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Docs",
};

export default function DocsIndexPage() {
  redirect("/docs/quickstart");
}