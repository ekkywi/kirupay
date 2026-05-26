import { NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcrypt";
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
    const { businessId, email, password, businessName } = await req.json();

    if (!businessId || !email || !password || !businessName) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "All fields are required.",
        requestId,
        retryable: false,
        details: { fields: ["businessId", "email", "password", "businessName"] },
      });
    }

    const membership = await prisma.businessMembership.findFirst({
      where: { businessId, isActive: true },
      select: { merchantId: true, businessId: true },
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

    const existingEmail = await prisma.merchant.findFirst({
      where: {
        email,
        id: { not: membership.merchantId },
      },
    });

    if (existingEmail) {
      return apiError(409, {
        code: "AUTH_PROFILE_EMAIL_CONFLICT",
        message: "This email is already registered to another account.",
        requestId,
        retryable: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.merchant.update({
        where: { id: membership.merchantId },
        data: {
          email,
          password: hashedPassword,
          businessName: businessName,
          emailVerified: false,
        },
      });

      const activeMembership = await tx.businessMembership.findFirst({
        where: { merchantId: membership.merchantId, isActive: true },
        include: { business: true },
        orderBy: { createdAt: "asc" },
      });

      if (activeMembership) {
        await tx.businessEntity.update({
          where: { id: activeMembership.businessId },
          data: { name: businessName, contactEmail: email },
        });
      }
    });

    const activationToken = await issueMerchantVerificationToken(membership.merchantId);

    if (!process.env.RESEND_API_KEY) {
      return apiError(500, {
        code: "EMAIL_DELIVERY_FAILED",
        message: "Email provider is not configured.",
        requestId,
        retryable: true,
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const activationUrl = buildActivationUrl(activationToken, process.env.FRONTEND_URL);
    const emailPayload = buildActivationEmail({
      businessName,
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
        message: "Profile updated, but activation email failed to send. Please try resend verification.",
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
      { message: "Profile updated and verification email sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Complete profile error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
