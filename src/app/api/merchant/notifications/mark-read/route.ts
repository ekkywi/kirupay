import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function POST(req: Request) {
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

    const body = (await req.json()) as { notificationId?: string; markAll?: boolean };
    const now = new Date();

    if (body.markAll) {
      await prisma.merchantNotification.updateMany({
        where: {
          merchantId: merchant.id,
          readAt: null,
        },
        data: {
          readAt: now,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (!body.notificationId) {
      return apiError(400, {
        code: "MERCHANT_INVALID_ACTION",
        message: "notificationId is required when markAll is false.",
        requestId,
        retryable: false,
      });
    }

    await prisma.merchantNotification.updateMany({
      where: {
        id: body.notificationId,
        merchantId: merchant.id,
        readAt: null,
      },
      data: {
        readAt: now,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
