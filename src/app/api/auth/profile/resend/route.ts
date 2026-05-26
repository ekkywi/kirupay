import { NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { issueMerchantVerificationToken } from "@/lib/email-verification";
import { buildActivationEmail, buildActivationUrl } from "@/lib/activation-email-template";

function maskActivationUrl(url: string) {
  try {
    const parsed = new URL(url);
    const token = parsed.searchParams.get("token");
    if (token && token.length > 10) {
      parsed.searchParams.set("token", `${token.slice(0, 6)}...${token.slice(-4)}`);
    } else if (token) {
      parsed.searchParams.set("token", "***");
    }
    return parsed.toString();
  } catch {
    return "invalid-url";
  }
}

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

    if (!process.env.RESEND_API_KEY) {
      return apiError(500, {
        code: "EMAIL_DELIVERY_FAILED",
        message: "Email provider is not configured.",
        requestId,
        retryable: true,
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const activationUrl = buildActivationUrl(newActivationToken, process.env.FRONTEND_URL);
    const emailPayload = buildActivationEmail({
      businessName: merchant.businessName,
      activationUrl,
    });

    const emailResult = await resend.emails.send({
      from: emailPayload.from,
      to: email,
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
    });

    if (emailResult.error || !emailResult.data?.id) {
      console.error("Activation email delivery failed", {
        requestId,
        to: email,
        from: emailPayload.from,
        subject: emailPayload.subject,
        activationUrl: maskActivationUrl(activationUrl),
        resendError: emailResult.error,
      });
      return apiError(502, {
        code: "EMAIL_DELIVERY_FAILED",
        message: "Failed to send verification email. Please try again shortly.",
        requestId,
        retryable: true,
      });
    }

    console.info("Activation email sent", {
      requestId,
      to: email,
      from: emailPayload.from,
      subject: emailPayload.subject,
      activationUrl: maskActivationUrl(activationUrl),
      resendMessageId: emailResult.data.id,
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
