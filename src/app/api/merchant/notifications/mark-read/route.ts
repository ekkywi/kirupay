import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { mapMerchantAccessError, requireBusinessMembership } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const ctx = await requireBusinessMembership();
    const businessId = ctx.business.id;

    const body = (await req.json()) as { notificationId?: string; markAll?: boolean };
    const now = new Date();

    if (body.markAll) {
      await prisma.merchantNotification.updateMany({
        where: {
          businessId,
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
        businessId,
        readAt: null,
      },
      data: {
        readAt: now,
      },
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
    console.error("Mark notification read error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
