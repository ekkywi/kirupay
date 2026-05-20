import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";

export async function POST() {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "POST /api/merchant/apikey/regenerate");

  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      recordObservation(obs, { outcome: "error", status: 401, errorCode: "MERCHANT_UNAUTHORIZED" });
      return apiError(401, {
        code: "MERCHANT_UNAUTHORIZED",
        message: "Unauthorized.",
        requestId,
        retryable: false,
      });
    }

    const newApiKey = `tl_live_${crypto.randomBytes(32).toString("hex")}`;

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { apiKey: newApiKey },
    });

    recordObservation(obs, { outcome: "success", status: 200 });
    return NextResponse.json(
      {
        success: true,
        message: "API key regenerated successfully",
        apiKey: newApiKey,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API key regeneration error", { requestId, error });
    recordObservation(obs, { outcome: "error", status: 500, errorCode: "INTERNAL_SERVER_ERROR" });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
