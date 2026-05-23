import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentActor } from "@/lib/auth-service";
import { setMerchantSessionToken } from "@/lib/merchant-session";
import { apiError, createRequestId } from "@/lib/api-errors";
import { hashBusinessInviteCode } from "@/lib/business-invite";

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
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const setActive = body?.setActive !== false;

    if (!code) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Invite code is required.",
        requestId,
        retryable: false,
        details: { fields: ["code"] },
      });
    }

    const codeHash = hashBusinessInviteCode(code);

    const invite = await (prisma as any).businessInvite.findUnique({
      where: { codeHash },
      include: { business: true },
    });

    if (!invite || !invite.business?.isActive) {
      return apiError(400, {
        code: "MERCHANT_INVALID_ACTION",
        message: "Invalid invite code.",
        requestId,
        retryable: false,
      });
    }

    if (invite.usedAt) {
      return apiError(409, {
        code: "MERCHANT_INVALID_ACTION",
        message: "Invite code has already been used.",
        requestId,
        retryable: false,
      });
    }

    if (new Date(invite.expiresAt).getTime() < Date.now()) {
      return apiError(400, {
        code: "MERCHANT_INVALID_ACTION",
        message: "Invite code has expired.",
        requestId,
        retryable: false,
      });
    }

    const membership = await prisma.businessMembership.findUnique({
      where: {
        merchantId_businessId: {
          merchantId: actor.merchant.id,
          businessId: invite.businessId,
        },
      },
    });

    if (membership?.isActive) {
      return apiError(409, {
        code: "MERCHANT_INVALID_ACTION",
        message: "You are already an active member of this business.",
        requestId,
        retryable: false,
      });
    }

    await prisma.$transaction(async (tx) => {
      if (membership) {
        await tx.businessMembership.update({
          where: { id: membership.id },
          data: {
            isActive: true,
            role: invite.role,
          },
        });
      } else {
        await tx.businessMembership.create({
          data: {
            merchantId: actor.merchant.id,
            businessId: invite.businessId,
            role: invite.role,
            isActive: true,
          },
        });
      }

      await (tx as any).businessInvite.update({
        where: { id: invite.id },
        data: {
          usedAt: new Date(),
          usedById: actor.merchant.id,
        },
      });

      if (setActive) {
        await tx.merchant.update({ where: { id: actor.merchant.id }, data: { activeBusinessId: invite.businessId } });
      }
    });

    if (setActive) {
      await setMerchantSessionToken({
        actorId: actor.merchant.id,
        email: actor.merchant.email,
        activeBusinessId: invite.businessId,
      });
    }

    return NextResponse.json({ success: true, businessId: invite.businessId, activeBusinessId: setActive ? invite.businessId : actor.merchant.activeBusinessId });
  } catch (error) {
    console.error("Join business via invite code error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
