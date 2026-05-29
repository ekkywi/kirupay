import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/neon";
import type { BusinessMembership, BusinessRole, InternalRole, InternalUser, Merchant } from "@prisma/client";

export type ActorType = "merchant" | "internal";

type JwtActorPayload = {
  actorType?: unknown;
  actorId?: unknown;
  activeBusinessId?: unknown;
};

export type CurrentActor =
  | { actorType: "merchant"; merchant: Merchant; activeBusinessId: string | null }
  | { actorType: "internal"; internalUser: InternalUser };

export type MerchantBusinessContext = {
  merchant: Merchant;
  business: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    credentials: { apiKey: string; webhookUrl: string | null; webhookSecret: string | null } | null;
    settlementWallet: { walletAddress: string } | null;
  };
  membership: BusinessMembership;
};

export async function getCurrentActor(): Promise<CurrentActor | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const tokenPayload = payload as JwtActorPayload;

    const actorType = typeof tokenPayload.actorType === "string" ? tokenPayload.actorType : null;
    const actorId = typeof tokenPayload.actorId === "string" ? tokenPayload.actorId : null;
    const tokenActiveBusinessId = typeof tokenPayload.activeBusinessId === "string" ? tokenPayload.activeBusinessId : null;

    if (actorType === "merchant" && actorId) {
      const merchant = await prisma.merchant.findUnique({ where: { id: actorId } });
      if (!merchant || !merchant.isActive) return null;
      return {
        actorType: "merchant",
        merchant,
        activeBusinessId: merchant.activeBusinessId ?? tokenActiveBusinessId,
      };
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

export async function getCurrentMerchantBusinessContext(): Promise<MerchantBusinessContext | null> {
  const actor = await getCurrentActor();
  if (!actor || actor.actorType !== "merchant") return null;

  const activeBusinessId = actor.activeBusinessId;
  const membership = activeBusinessId
    ? await prisma.businessMembership.findUnique({
        where: {
          merchantId_businessId: {
            merchantId: actor.merchant.id,
            businessId: activeBusinessId,
          },
        },
        include: {
          business: {
            include: {
              credentials: true,
              settlementWallets: {
                where: { isActive: true },
                take: 1,
              },
            },
          },
        },
      })
    : null;

  if (!membership || !membership.isActive || !membership.business.isActive) {
    const fallbackMembership = await prisma.businessMembership.findFirst({
      where: {
        merchantId: actor.merchant.id,
        isActive: true,
        business: { isActive: true },
      },
      include: {
        business: {
          include: {
            credentials: true,
            settlementWallets: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!fallbackMembership) return null;

    await prisma.merchant.update({
      where: { id: actor.merchant.id },
      data: { activeBusinessId: fallbackMembership.businessId },
    });

    return {
      merchant: actor.merchant,
      membership: fallbackMembership,
      business: {
        id: fallbackMembership.business.id,
        name: fallbackMembership.business.name,
        code: fallbackMembership.business.code,
        isActive: fallbackMembership.business.isActive,
        credentials: fallbackMembership.business.credentials
          ? {
              apiKey: fallbackMembership.business.credentials.apiKey,
              webhookUrl: fallbackMembership.business.credentials.webhookUrl,
              webhookSecret: fallbackMembership.business.credentials.webhookSecret,
            }
          : null,
        settlementWallet: fallbackMembership.business.settlementWallets[0]
          ? { walletAddress: fallbackMembership.business.settlementWallets[0].walletAddress }
          : null,
      },
    };
  }

  return {
    merchant: actor.merchant,
    membership,
    business: {
      id: membership.business.id,
      name: membership.business.name,
      code: membership.business.code,
      isActive: membership.business.isActive,
      credentials: membership.business.credentials
        ? {
            apiKey: membership.business.credentials.apiKey,
            webhookUrl: membership.business.credentials.webhookUrl,
            webhookSecret: membership.business.credentials.webhookSecret,
          }
        : null,
      settlementWallet: membership.business.settlementWallets[0]
        ? { walletAddress: membership.business.settlementWallets[0].walletAddress }
        : null,
    },
  };
}

export async function requireBusinessMembership(options?: { roles?: BusinessRole[] }) {
  const ctx = await getCurrentMerchantBusinessContext();
  if (!ctx) throw new Error("Unauthorized");

  if (options?.roles && options.roles.length > 0 && !options.roles.includes(ctx.membership.role)) {
    throw new Error("Forbidden");
  }

  return ctx;
}

export async function requireBusinessMembershipById(
  businessId: string,
  options?: { roles?: BusinessRole[] },
): Promise<MerchantBusinessContext> {
  const actor = await getCurrentActor();
  if (!actor || actor.actorType !== "merchant") {
    throw new Error("Unauthorized");
  }

  const membership = await prisma.businessMembership.findUnique({
    where: {
      merchantId_businessId: {
        merchantId: actor.merchant.id,
        businessId,
      },
    },
    include: {
      business: {
        include: {
          credentials: true,
          settlementWallets: {
            where: { isActive: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!membership || !membership.isActive || !membership.business.isActive) {
    throw new Error("Forbidden");
  }

  if (options?.roles && options.roles.length > 0 && !options.roles.includes(membership.role)) {
    throw new Error("Forbidden");
  }

  return {
    merchant: actor.merchant,
    membership,
    business: {
      id: membership.business.id,
      name: membership.business.name,
      code: membership.business.code,
      isActive: membership.business.isActive,
      credentials: membership.business.credentials
        ? {
            apiKey: membership.business.credentials.apiKey,
            webhookUrl: membership.business.credentials.webhookUrl,
            webhookSecret: membership.business.credentials.webhookSecret,
          }
        : null,
      settlementWallet: membership.business.settlementWallets[0]
        ? { walletAddress: membership.business.settlementWallets[0].walletAddress }
        : null,
    },
  };
}

export function mapMerchantAccessError(error: unknown): { status: 401 | 403; code: "MERCHANT_UNAUTHORIZED" | "MERCHANT_FORBIDDEN"; message: string } {
  if (error instanceof Error && error.message === "Forbidden") {
    return {
      status: 403,
      code: "MERCHANT_FORBIDDEN",
      message: "Forbidden.",
    };
  }

  return {
    status: 401,
    code: "MERCHANT_UNAUTHORIZED",
    message: "Unauthorized.",
  };
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
