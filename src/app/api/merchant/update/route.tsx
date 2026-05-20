import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { getCurrentMerchant } from "@/lib/auth-service";
import crypto from "crypto";
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

    const { webhookUrl, businessName } = (await req.json()) as {
      webhookUrl?: string;
      businessName?: string;
    };

    const updateData: { webhookUrl?: string; businessName?: string; webhookSecret?: string } = {};

    if (businessName !== undefined) updateData.businessName = businessName;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;

    if (webhookUrl && !merchant.webhookSecret) {
      updateData.webhookSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
    }

    const updated = await prisma.merchant.update({
      where: { id: merchant.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update merchant error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
