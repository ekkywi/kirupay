import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentActor } from "@/lib/auth-service";
import { setMerchantSessionToken } from "@/lib/merchant-session";
import { apiError, createRequestId } from "@/lib/api-errors";

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
    const businessId = typeof body?.businessId === "string" ? body.businessId : "";

    if (!businessId) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "businessId is required.",
        requestId,
        retryable: false,
        details: { fields: ["businessId"] },
      });
    }

    const membership = await prisma.businessMembership.findFirst({
      where: {
        merchantId: actor.merchant.id,
        businessId,
        isActive: true,
        business: { isActive: true },
      },
    });

    if (!membership) {
      return apiError(403, {
        code: "MERCHANT_FORBIDDEN",
        message: "You are not an active member of this business.",
        requestId,
        retryable: false,
      });
    }

    await prisma.merchant.update({ where: { id: actor.merchant.id }, data: { activeBusinessId: businessId } });
    await setMerchantSessionToken({
      actorId: actor.merchant.id,
      email: actor.merchant.email,
      activeBusinessId: businessId,
    });

    return NextResponse.json({ success: true, activeBusinessId: businessId });
  } catch (error) {
    console.error("Switch business error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
