import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { mapMerchantAccessError, requireBusinessMembership } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function GET() {
  const requestId = createRequestId();

  try {
    const ctx = await requireBusinessMembership();
    const businessId = ctx.business.id;

    const unread = await prisma.merchantNotification.count({
      where: {
        businessId,
        readAt: null,
      },
    });

    return NextResponse.json({ success: true, data: { unread } });
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
    console.error("Fetch unread notifications count error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
