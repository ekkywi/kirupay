import { NextResponse } from "next/server";
import prisma from "@/lib/neon";
import { requireBusinessMembership, mapMerchantAccessError, requireBusinessMembershipById } from "@/lib/auth-service";
import { apiError, createRequestId } from "@/lib/api-errors";
import { generateBusinessInviteCode, hashBusinessInviteCode, inviteCodeHint } from "@/lib/business-invite";

export async function GET(req: Request) {
  const requestId = createRequestId();

  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("businessId");
    const ctx = businessId ? await requireBusinessMembershipById(businessId) : await requireBusinessMembership();

    const invites = await (prisma as any).businessInvite.findMany({
      where: { businessId: ctx.business.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return NextResponse.json({ success: true, data: invites });
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

    console.error("List business invites error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const body = await req.json();
    const businessId = typeof body?.businessId === "string" ? body.businessId : null;
    const ctx = businessId
      ? await requireBusinessMembershipById(businessId, { roles: ["OWNER", "ADMIN"] })
      : await requireBusinessMembership({ roles: ["OWNER", "ADMIN"] });

    const role = body?.role === "ADMIN" ? "ADMIN" : "MEMBER";
    const expiresInHoursRaw = Number(body?.expiresInHours || 72);
    const expiresInHours = Number.isFinite(expiresInHoursRaw)
      ? Math.min(Math.max(Math.floor(expiresInHoursRaw), 1), 24 * 30)
      : 72;

    const code = generateBusinessInviteCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const invite = await (prisma as any).businessInvite.create({
      data: {
        businessId: ctx.business.id,
        codeHash: hashBusinessInviteCode(code),
        codeHint: inviteCodeHint(code),
        role,
        expiresAt,
        createdBy: ctx.merchant.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...invite,
        code,
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

    console.error("Create business invite error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
