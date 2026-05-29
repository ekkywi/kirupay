import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { mapMerchantAccessError, requireBusinessMembershipById } from "@/lib/auth-service";
import { setMerchantSessionToken } from "@/lib/merchant-session";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function PATCH(req: Request, context: { params: Promise<{ id: string; memberId: string }> }) {
  const requestId = createRequestId();

  try {
    const { id, memberId } = await context.params;
    const ctx = await requireBusinessMembershipById(id, { roles: ["OWNER"] });

    const body = await req.json();
    const role = body?.role;
    const isActive = typeof body?.isActive === "boolean" ? body.isActive : undefined;

    if (role !== undefined && role !== "ADMIN" && role !== "MEMBER") {
      return apiError(400, {
        code: "MERCHANT_INVALID_ACTION",
        message: "Invalid role.",
        requestId,
        retryable: false,
      });
    }

    const target = await prisma.businessMembership.findFirst({
      where: { id: memberId, businessId: id },
    });

    if (!target) {
      return apiError(404, {
        code: "AUTH_MERCHANT_NOT_FOUND",
        message: "Membership not found.",
        requestId,
        retryable: false,
      });
    }

    if (target.merchantId === ctx.merchant.id && isActive === false) {
      return apiError(400, {
        code: "MERCHANT_INVALID_ACTION",
        message: "Owner cannot deactivate own membership.",
        requestId,
        retryable: false,
      });
    }

    const updated = await prisma.businessMembership.update({
      where: { id: target.id },
      data: {
        ...(role ? { role } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      const mapped = mapMerchantAccessError(error);
      return apiError(mapped.status, {
        code: mapped.code,
        message: mapped.message,
        requestId,
        retryable: false,
      });
    }

    console.error("Update business member error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string; memberId: string }> }) {
  const requestId = createRequestId();

  try {
    const { id, memberId } = await context.params;
    const ctx = await requireBusinessMembershipById(id, { roles: ["OWNER"] });

    const target = await prisma.businessMembership.findFirst({
      where: { id: memberId, businessId: id },
    });

    if (!target) {
      return apiError(404, {
        code: "AUTH_MERCHANT_NOT_FOUND",
        message: "Membership not found.",
        requestId,
        retryable: false,
      });
    }

    if (target.role === "OWNER") {
      return apiError(400, {
        code: "MERCHANT_INVALID_ACTION",
        message: "Owner membership cannot be removed.",
        requestId,
        retryable: false,
      });
    }

    let nextActiveBusinessId: string | null = null;

    await prisma.$transaction(async (tx) => {
      await tx.businessMembership.delete({ where: { id: target.id } });

      if (target.merchantId === ctx.merchant.id) {
        const nextActive = await tx.businessMembership.findFirst({
          where: { merchantId: ctx.merchant.id, isActive: true, business: { isActive: true } },
          orderBy: { createdAt: "asc" },
        });

        nextActiveBusinessId = nextActive?.businessId || null;

        await tx.merchant.update({
          where: { id: ctx.merchant.id },
          data: { activeBusinessId: nextActiveBusinessId },
        });
      }
    });

    if (target.merchantId === ctx.merchant.id) {
      await setMerchantSessionToken({
        actorId: ctx.merchant.id,
        email: ctx.merchant.email,
        activeBusinessId: nextActiveBusinessId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      const mapped = mapMerchantAccessError(error);
      return apiError(mapped.status, {
        code: mapped.code,
        message: mapped.message,
        requestId,
        retryable: false,
      });
    }

    console.error("Delete business member error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
