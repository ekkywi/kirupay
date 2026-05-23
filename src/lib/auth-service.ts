import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/neon";
import type { InternalRole, InternalUser, Merchant } from "@prisma/client";

export type ActorType = "merchant" | "internal";

type JwtActorPayload = {
  actorType?: unknown;
  actorId?: unknown;
  merchantId?: unknown;
};

export type CurrentActor =
  | { actorType: "merchant"; merchant: Merchant }
  | { actorType: "internal"; internalUser: InternalUser };

export async function getCurrentActor(): Promise<CurrentActor | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const tokenPayload = payload as JwtActorPayload;

    // Backward compatibility for legacy sessions that only carry merchantId.
    const legacyMerchantId = typeof tokenPayload.merchantId === "string" ? tokenPayload.merchantId : null;
    const actorType = typeof tokenPayload.actorType === "string" ? tokenPayload.actorType : null;
    const actorId = typeof tokenPayload.actorId === "string" ? tokenPayload.actorId : null;

    if ((actorType === "merchant" && actorId) || legacyMerchantId) {
      const merchantId = actorType === "merchant" && actorId ? actorId : legacyMerchantId!;
      const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
      if (!merchant) return null;
      return { actorType: "merchant", merchant };
    }

    if (actorType === "internal" && actorId) {
      const internalUser = await prisma.internalUser.findUnique({ where: { id: actorId } });
      if (!internalUser || !internalUser.isActive) return null;
      return { actorType: "internal", internalUser };
    }

    return null;
  } catch (error) {
    console.error("Error getting current actor:", error);
    return null;
  }
}

export async function getCurrentMerchant() {
  const actor = await getCurrentActor();
  if (!actor || actor.actorType !== "merchant") return null;
  return actor.merchant;
}

export async function requireMerchantUser() {
  const merchant = await getCurrentMerchant();
  if (!merchant) throw new Error("Unauthorized");
  return merchant;
}

export async function requireInternalUser(options?: { roles?: InternalRole[] }) {
  const actor = await getCurrentActor();
  if (!actor || actor.actorType !== "internal") {
    throw new Error("Unauthorized");
  }

  if (options?.roles && options.roles.length > 0 && !options.roles.includes(actor.internalUser.role)) {
    throw new Error("Forbidden");
  }

  return actor.internalUser;
}
