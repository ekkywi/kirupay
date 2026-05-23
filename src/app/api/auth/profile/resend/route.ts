import { NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { issueMerchantVerificationToken } from "@/lib/email-verification";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const { businessId, email } = await req.json();

    if (!businessId || !email) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Missing required fields.",
        requestId,
        retryable: false,
        details: { fields: ["businessId", "email"] },
      });
    }

    const membership = await prisma.businessMembership.findFirst({
      where: { businessId, isActive: true },
      select: { merchantId: true },
      orderBy: { createdAt: "asc" },
    });

    if (!membership) {
      return apiError(404, {
        code: "AUTH_MERCHANT_NOT_FOUND",
        message: "Merchant not found for this business.",
        requestId,
        retryable: false,
      });
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: membership.merchantId } });

    if (!merchant) {
      return apiError(404, {
        code: "AUTH_MERCHANT_NOT_FOUND",
        message: "Merchant not found.",
        requestId,
        retryable: false,
      });
    }

    if (merchant.emailVerified) {
      return apiError(400, {
        code: "AUTH_EMAIL_ALREADY_VERIFIED",
        message: "Email is already verified.",
        requestId,
        retryable: false,
      });
    }

    const newActivationToken = await issueMerchantVerificationToken(membership.merchantId);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = process.env.FRONTEND_URL;

    await resend.emails.send({
      from: "Kirupay <noreply@kirupay.com>",
      to: email,
      subject: "Action Required: Verify Your Kirupay Account",
      html: `<!DOCTYPE html><html><body><p>Hello ${merchant.businessName}, verify your account:</p><a href="${baseUrl}/activate?token=${newActivationToken}">Verify</a></body></html>`,
    });

    return NextResponse.json(
      { message: "Verification email re-sent successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend email error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
