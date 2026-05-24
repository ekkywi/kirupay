import { NextResponse } from "next/server";
import { apiError, createRequestId } from "@/lib/api-errors";
import { mapMerchantAccessError, requireBusinessMembershipById } from "@/lib/auth-service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId();

  try {
    const { id } = await context.params;
    const ctx = await requireBusinessMembershipById(id);

    return NextResponse.json({
      success: true,
      data: {
        membership: {
          id: ctx.membership.id,
          role: ctx.membership.role,
          isActive: ctx.membership.isActive,
        },
        business: {
          id: ctx.business.id,
          name: ctx.business.name,
          code: ctx.business.code,
          isActive: ctx.business.isActive,
          contactEmail: ctx.membership.business.contactEmail,
          settlementWalletAddress: ctx.business.settlementWallet?.walletAddress || null,
          apiKey: ctx.business.credentials?.apiKey || null,
          webhookUrl: ctx.business.credentials?.webhookUrl || null,
          webhookSecret: ctx.business.credentials?.webhookSecret || null,
        },
      },
    });
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

    console.error("Get business manage context error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
