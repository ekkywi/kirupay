import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";
import { requireBusinessMembership } from "@/lib/auth-service";

function mapAccessError(error: unknown): { status: 401 | 403; code: "MERCHANT_UNAUTHORIZED" | "MERCHANT_FORBIDDEN"; message: string } {
  if (error instanceof Error && error.message === "Forbidden") {
    return { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." };
  }
  return { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." };
}

export async function POST() {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "POST /api/merchant/apikey/regenerate");

  try {
    let ctx;
    try {
      ctx = await requireBusinessMembership({ roles: ["OWNER", "ADMIN"] });
    } catch (error) {
      const accessError = mapAccessError(error);
      recordObservation(obs, { outcome: "error", status: accessError.status, errorCode: accessError.code });
      return apiError(accessError.status, {
        code: accessError.code,
        message: accessError.message,
        requestId,
        retryable: false,
      });
    }

    const newApiKey = `tl_live_${crypto.randomBytes(32).toString("hex")}`;

    await prisma.businessCredential.upsert({
      where: { businessId: ctx.business.id },
      create: { businessId: ctx.business.id, apiKey: newApiKey, rotatedAt: new Date() },
      update: { apiKey: newApiKey, rotatedAt: new Date() },
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
