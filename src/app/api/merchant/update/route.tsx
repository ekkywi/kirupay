import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import crypto from "crypto";
import { apiError, createRequestId } from "@/lib/api-errors";
import { requireBusinessMembership, requireBusinessMembershipById } from "@/lib/auth-service";

function mapAccessError(error: unknown): { status: 401 | 403; code: "MERCHANT_UNAUTHORIZED" | "MERCHANT_FORBIDDEN"; message: string } {
  if (error instanceof Error && error.message === "Forbidden") {
    return { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." };
  }
  return { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." };
}

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const payload = (await req.json()) as {
      webhookUrl?: string;
      businessName?: string;
      businessId?: string;
    };
    const targetBusinessId = typeof payload.businessId === "string" ? payload.businessId : null;

    let ctx;
    try {
      ctx = targetBusinessId
        ? await requireBusinessMembershipById(targetBusinessId, { roles: ["OWNER", "ADMIN"] })
        : await requireBusinessMembership({ roles: ["OWNER", "ADMIN"] });
    } catch (error) {
      const accessError = mapAccessError(error);
      return apiError(accessError.status, {
        code: accessError.code,
        message: accessError.message,
        requestId,
        retryable: false,
      });
    }

    const { webhookUrl, businessName } = payload;

    if (businessName !== undefined) {
      await prisma.businessEntity.update({
        where: { id: ctx.business.id },
        data: { name: businessName },
      });
    }

    if (webhookUrl !== undefined) {
      const currentCred = await prisma.businessCredential.findUnique({ where: { businessId: ctx.business.id } });
      await prisma.businessCredential.upsert({
        where: { businessId: ctx.business.id },
        create: {
          businessId: ctx.business.id,
          apiKey: `tl_live_${crypto.randomBytes(32).toString("hex")}`,
          webhookUrl,
          webhookSecret: webhookUrl ? `whsec_${crypto.randomBytes(24).toString("hex")}` : null,
        },
        update: {
          webhookUrl,
          webhookSecret: webhookUrl && !currentCred?.webhookSecret ? `whsec_${crypto.randomBytes(24).toString("hex")}` : currentCred?.webhookSecret ?? null,
        },
      });
    }

    const updated = await prisma.businessEntity.findUnique({
      where: { id: ctx.business.id },
      include: { credentials: true },
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
