// src/app/(main)/admin/layout.tsx
import { redirect } from "next/navigation";
import { requireInternalUser } from "@/lib/auth-service";

export default async function AdminSecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireInternalUser();
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}
