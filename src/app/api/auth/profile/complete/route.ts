import { NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const { merchantId, email, password, businessName } = await req.json();

    if (!merchantId || !email || !password || !businessName) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "All fields are required.",
        requestId,
        retryable: false,
        details: { fields: ["merchantId", "email", "password", "businessName"] },
      });
    }

    const existingEmail = await prisma.merchant.findFirst({
      where: {
        email,
        id: { not: merchantId },
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
    const activationToken = crypto.randomBytes(32).toString("hex");

    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        email,
        password: hashedPassword,
        businessName,
        activationToken,
        emailVerified: false,
      },
    });

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
