import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import crypto from "crypto";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";
import { requireBusinessMembership, requireBusinessMembershipById } from "@/lib/auth-service";

function mapAccessError(error: unknown): { status: 401 | 403; code: "MERCHANT_UNAUTHORIZED" | "MERCHANT_FORBIDDEN"; message: string } {
  if (error instanceof Error && error.message === "Forbidden") {
    return { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." };
  }
  return { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." };
}

export async function POST(req?: Request) {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "POST /api/merchant/webhook/regenerate");

  try {
    const body = ((await req?.json?.().catch(() => ({}))) || {}) as { businessId?: string };
    const targetBusinessId = typeof body.businessId === "string" ? body.businessId : null;

    let ctx;
    try {
      ctx = targetBusinessId
        ? await requireBusinessMembershipById(targetBusinessId, { roles: ["OWNER", "ADMIN"] })
        : await requireBusinessMembership({ roles: ["OWNER", "ADMIN"] });
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

    const newWebhookSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    const updatedCredential = await prisma.businessCredential.upsert({
      where: { businessId: ctx.business.id },
      create: { businessId: ctx.business.id, apiKey: `tl_live_${crypto.randomBytes(32).toString("hex")}`, webhookSecret: newWebhookSecret },
      update: { webhookSecret: newWebhookSecret },
    });

    recordObservation(obs, { outcome: "success", status: 200 });
    return NextResponse.json(
      {
        success: true,
        webhookSecret: updatedCredential.webhookSecret,
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
