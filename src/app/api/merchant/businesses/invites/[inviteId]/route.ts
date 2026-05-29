import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { requireBusinessMembershipById, mapMerchantAccessError } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

type BusinessInviteRow = {
  id: string;
  businessId: string;
  usedAt: Date | null;
};

type BusinessInviteClient = {
  findFirst: (args: { where: { id: string; businessId: string } }) => Promise<BusinessInviteRow | null>;
  delete: (args: { where: { id: string } }) => Promise<BusinessInviteRow>;
};

export async function DELETE(req: Request, context: { params: Promise<{ inviteId: string }> }) {
  const requestId = createRequestId();

  try {
    const { inviteId } = await context.params;
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "businessId is required.",
        requestId,
        retryable: false,
        details: { fields: ["businessId"] },
      });
    }

    await requireBusinessMembershipById(businessId, { roles: ["OWNER", "ADMIN"] });

    const businessInvite = (prisma as unknown as { businessInvite?: BusinessInviteClient }).businessInvite;
    if (!businessInvite) throw new Error("Business invite client unavailable");

    const invite = await businessInvite.findFirst({ where: { id: inviteId, businessId } });
    if (!invite) {
      return apiError(404, {
        code: "AUTH_MERCHANT_NOT_FOUND",
        message: "Invitation code not found.",
        requestId,
        retryable: false,
      });
    }

    if (invite.usedAt) {
      return apiError(400, {
        code: "MERCHANT_INVALID_ACTION",
        message: "Used invitation code cannot be deleted.",
        requestId,
        retryable: false,
      });
    }

    await businessInvite.delete({ where: { id: invite.id } });

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

    console.error("Delete business invite error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
