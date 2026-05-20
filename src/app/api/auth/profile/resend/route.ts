import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const { merchantId, email } = await req.json();

    if (!merchantId || !email) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Missing required fields.",
        requestId,
        retryable: false,
        details: { fields: ["merchantId", "email"] },
      });
    }

    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });

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

    const newActivationToken = crypto.randomBytes(32).toString("hex");

    await prisma.merchant.update({
      where: { id: merchantId },
      data: { activationToken: newActivationToken },
    });

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
