import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internal Register",
};

export default function InternalRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
