import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { mapMerchantAccessError, requireBusinessMembership } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId();

  try {
    const ctx = await requireBusinessMembership();
    const { id } = await context.params;

    if (ctx.business.id !== id) {
      return apiError(403, {
        code: "MERCHANT_FORBIDDEN",
        message: "Forbidden.",
        requestId,
        retryable: false,
      });
    }

    const members = await prisma.businessMembership.findMany({
      where: { businessId: id },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            businessName: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: members });
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

    console.error("List business members error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
