import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { mapMerchantAccessError, requireBusinessMembershipById } from "@/lib/auth-service";
import { setMerchantSessionToken } from "@/lib/merchant-session";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId();

  try {
    const { id } = await context.params;
    await requireBusinessMembershipById(id, { roles: ["OWNER", "ADMIN"] });

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim() : undefined;

    if (!name && !contactEmail) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "At least one field must be provided.",
        requestId,
        retryable: false,
        details: { fields: ["name", "contactEmail"] },
      });
    }

    const updated = await prisma.businessEntity.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(contactEmail ? { contactEmail } : {}),
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

    console.error("Patch business error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId();

  try {
    const { id } = await context.params;
    const ctx = await requireBusinessMembershipById(id, { roles: ["OWNER"] });
    let nextActiveBusinessId: string | null = null;

    await prisma.$transaction(async (tx) => {
      await tx.businessEntity.update({ where: { id }, data: { isActive: false } });
      await tx.businessMembership.updateMany({ where: { businessId: id }, data: { isActive: false } });
      await tx.businessWalletIdentity.updateMany({
        where: { businessId: id, isActive: true },
        data: { isActive: false, unlinkedAt: new Date() },
      });

      const nextActive = await tx.businessMembership.findFirst({
        where: { merchantId: ctx.merchant.id, isActive: true, business: { isActive: true } },
        orderBy: { createdAt: "asc" },
      });

      nextActiveBusinessId = nextActive?.businessId || null;

      await tx.merchant.update({
        where: { id: ctx.merchant.id },
        data: { activeBusinessId: nextActiveBusinessId },
      });
    });

    await setMerchantSessionToken({
      actorId: ctx.merchant.id,
      email: ctx.merchant.email,
      activeBusinessId: nextActiveBusinessId,
    });

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

    console.error("Delete business error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
