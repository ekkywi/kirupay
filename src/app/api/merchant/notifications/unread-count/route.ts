import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function GET() {
  const requestId = createRequestId();

  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return apiError(401, {
        code: "MERCHANT_UNAUTHORIZED",
        message: "Unauthorized.",
        requestId,
        retryable: false,
      });
    }

    const unread = await prisma.merchantNotification.count({
      where: {
        merchantId: merchant.id,
        readAt: null,
      },
    });

    return NextResponse.json({ success: true, data: { unread } });
  } catch (error) {
    console.error("Fetch unread notifications count error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
