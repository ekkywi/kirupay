import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

const MAX_LIMIT = 50;

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limitRaw = Number(searchParams.get("limit") || "20");
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), MAX_LIMIT) : 20;

    const data = await prisma.merchantNotification.findMany({
      where: { merchantId: merchant.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = data.length > limit;
    const notifications = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? notifications[notifications.length - 1]?.id ?? null : null;

    return NextResponse.json({ success: true, data: notifications, pagination: { nextCursor, hasMore } });
  } catch (error) {
    console.error("Fetch notifications error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
