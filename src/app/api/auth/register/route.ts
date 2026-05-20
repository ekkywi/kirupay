import { NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const body = await req.json();
    const { businessName, email, password, walletAddress } = body;

    if (!businessName || !email || !password || !walletAddress) {
      return apiError(400, {
        code: "AUTH_MISSING_REQUIRED_FIELDS",
        message: "Missing required fields.",
        requestId,
        retryable: false,
        details: { fields: ["businessName", "email", "password", "walletAddress"] },
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(password)) {
      return apiError(400, {
        code: "CHECKOUT_VALIDATION_FAILED",
        message: "Password does not meet security requirements.",
        requestId,
        retryable: false,
      });
    }

    const [existingMerchant, existingWalletIdentity] = await Promise.all([
      prisma.merchant.findFirst({ where: { OR: [{ email }, { walletAddress }] } }),
      prisma.merchantWalletIdentity.findUnique({ where: { walletAddress } }),
    ]);

    if (existingMerchant || existingWalletIdentity) {
      return apiError(409, {
        code: "AUTH_PROFILE_EMAIL_CONFLICT",
        message: "Merchant with this email or wallet address already exists.",
        requestId,
        retryable: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const resend = new Resend(process.env.RESEND_API_KEY);
    const activationToken = crypto.randomBytes(32).toString("hex");

    await prisma.merchant.create({
      data: {
        businessName,
        email,
        walletAddress,
        password: hashedPassword,
        activationToken,
        emailVerified: false,
        apiKey: `tl_live_${crypto.randomBytes(32).toString("hex")}`,
        walletIdentities: {
          create: {
            walletAddress,
            isActive: true,
            linkedAt: new Date(),
          },
        },
      },
    });

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    await resend.emails.send({
      from: "Kirupay <noreply@kirupay.com>",
      to: email,
      subject: "Action Required: Verify Your Kirupay Account",
      html: `<!DOCTYPE html><html><body><p>Hello ${businessName}, verify your account:</p><a href="${baseUrl}/activate?token=${activationToken}">Verify</a></body></html>`,
    });

    return NextResponse.json(
      { message: "Merchant registered successfully. Please check your email." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error registering merchant", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
