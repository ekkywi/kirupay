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

  const transactions =
    actor.actorType === "merchant" && actor.activeBusinessId
      ? await prisma.transaction.findMany({
          where: { businessId: actor.activeBusinessId },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const totalRevenue = actor.actorType === "merchant"
    ? transactions
        .filter((tx) => tx.status === "PAID")
        .reduce((acc, tx) => acc + (tx.netAmount ?? tx.amount ?? 0), 0)
    : 0;

  const activeBusiness =
    actor.actorType === "merchant" && actor.activeBusinessId
      ? await prisma.businessEntity.findUnique({
          where: { id: actor.activeBusinessId },
          select: { id: true, name: true },
        })
      : null;

  const shellIdentity =
    actor.actorType === "merchant"
      ? {
          actorType: "merchant" as const,
          businessName: activeBusiness?.name || actor.merchant.businessName,
          displayName: actor.merchant.businessName,
          email: actor.merchant.email,
          activeBusinessId: actor.activeBusinessId,
        }
      : {
          actorType: "internal" as const,
          businessName: actor.internalUser.name,
          displayName: actor.internalUser.name,
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
