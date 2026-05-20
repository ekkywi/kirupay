import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import crypto from "crypto";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";

export async function POST() {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "POST /api/merchant/webhook/regenerate");

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

    const newWebhookSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: { webhookSecret: newWebhookSecret },
    });

    recordObservation(obs, { outcome: "success", status: 200 });
    return NextResponse.json(
      {
        success: true,
        webhookSecret: updatedMerchant.webhookSecret,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Webhook secret regeneration error", { requestId, error });
    recordObservation(obs, { outcome: "error", status: 500, errorCode: "INTERNAL_SERVER_ERROR" });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
