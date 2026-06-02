import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internal Login",
};

export default function InternalLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
