import { NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcrypt";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { issueMerchantVerificationToken } from "@/lib/email-verification";

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

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const baseUrl = process.env.FRONTEND_URL;

    await resend.emails.send({
      from: "Kirupay <noreply@kirupay.com>",
      to: email,
      subject: "Action Required: Verify Your Kirupay Account",
      html: `<!DOCTYPE html><html><body><p>Hello ${businessName}, verify your account:</p><a href="${baseUrl}/activate?token=${activationToken}">Verify</a></body></html>`,
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
