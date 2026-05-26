import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { mapMerchantAccessError, requireBusinessMembership, requireBusinessMembershipById } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function GET(req: Request) {
  const requestId = createRequestId();

  try {
    const { searchParams } = new URL(req.url);
    const businessIdParam = searchParams.get("businessId");

    const ctx = businessIdParam
      ? await requireBusinessMembershipById(businessIdParam)
      : await requireBusinessMembership();

    const logs = await prisma.webhookLog.findMany({
      where: { businessId: ctx.business.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: logs }, { status: 200 });
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
    console.error("Fetch webhook logs error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
