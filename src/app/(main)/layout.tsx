// src/app/dashboard/layout.tsx
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getCurrentActor } from "@/lib/auth-service";
import prisma from "@/lib/neon";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const actor = await getCurrentActor();

  if (!actor) {
    redirect("/login");
  }

  const transactions = actor.actorType === "merchant"
    ? await prisma.transaction.findMany({
        where: { merchantId: actor.merchant.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const totalRevenue = actor.actorType === "merchant"
    ? transactions
        .filter((tx) => tx.status === "PAID")
        .reduce((acc, tx) => acc + (tx.netAmount ?? tx.amount ?? 0), 0)
    : 0;

  const shellIdentity =
    actor.actorType === "merchant"
      ? {
          actorType: "merchant" as const,
          businessName: actor.merchant.businessName,
          email: actor.merchant.email,
        }
      : {
          actorType: "internal" as const,
          businessName: actor.internalUser.name,
          email: actor.internalUser.email,
        };

  return (
    <DashboardShell 
      merchant={shellIdentity}
      transactions={transactions}
      totalRevenue={totalRevenue}
    >
      {children}
    </DashboardShell>
  );
}
