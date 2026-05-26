import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/neon";
import { getCurrentActor } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

function toBusinessCode(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${normalized || "business"}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function GET() {
  const requestId = createRequestId();

  try {
    const actor = await getCurrentActor();
    if (!actor || actor.actorType !== "merchant") {
      return apiError(401, {
        code: "MERCHANT_UNAUTHORIZED",
        message: "Unauthorized.",
        requestId,
        retryable: false,
      });
    }

    const memberships = await prisma.businessMembership.findMany({
      where: { merchantId: actor.merchant.id, isActive: true, business: { isActive: true } },
      include: {
        business: {
          include: {
            settlementWallets: { where: { isActive: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: memberships.map((membership) => ({
        membershipId: membership.id,
        role: membership.role,
        isActive: membership.isActive,
        business: {
          id: membership.business.id,
          name: membership.business.name,
          code: membership.business.code,
          isActive: membership.business.isActive,
          contactEmail: membership.business.contactEmail,
          settlementWalletAddress: membership.business.settlementWallets[0]?.walletAddress || null,
        },
        isCurrent: actor.merchant.activeBusinessId === membership.businessId,
      })),
      activeBusinessId: actor.merchant.activeBusinessId,
    });
  } catch (error) {
    console.error("List businesses error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const actor = await getCurrentActor();
    if (!actor || actor.actorType !== "merchant") {
      return apiError(401, {
        code: "MERCHANT_UNAUTHORIZED",
        message: "Unauthorized.",
        requestId,
        retryable: false,
      });
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim() : actor.merchant.email;
    const setActive = body?.setActive !== false;

    if (!name) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Business name is required.",
        requestId,
        retryable: false,
        details: { fields: ["name"] },
      });
    }

    const created = await prisma.$transaction(async (tx) => {
      const business = await tx.businessEntity.create({
        data: {
          name,
          code: toBusinessCode(name),
          contactEmail,
        },
      });

      const membership = await tx.businessMembership.create({
        data: {
          merchantId: actor.merchant.id,
          businessId: business.id,
          role: "OWNER",
          isActive: true,
        },
      });

      await tx.businessCredential.create({
        data: {
          businessId: business.id,
          apiKey: `tl_live_${crypto.randomBytes(32).toString("hex")}`,
        },
      });

      if (setActive) {
        await tx.merchant.update({ where: { id: actor.merchant.id }, data: { activeBusinessId: business.id } });
      }

      return { business, membership };
    });

    return NextResponse.json({
      success: true,
      data: {
        business: created.business,
        membership: created.membership,
        activeBusinessId: setActive ? created.business.id : actor.merchant.activeBusinessId,
      },
    });
  } catch (error) {
    console.error("Create business error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
