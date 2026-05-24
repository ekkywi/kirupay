import { NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcrypt";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { issueMerchantVerificationToken } from "@/lib/email-verification";

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
      prisma.merchant.findUnique({ where: { email } }),
      prisma.merchantPrivateWalletIdentity.findUnique({ where: { walletAddress } }),
    ]);

    if (existingMerchant) {
      return apiError(409, {
        code: "AUTH_PROFILE_EMAIL_CONFLICT",
        message: "Merchant with this email already exists.",
        requestId,
        retryable: false,
      });
    }

    if (existingWalletIdentity?.isActive) {
      return apiError(409, {
        code: "AUTH_PROFILE_EMAIL_CONFLICT",
        message: "Wallet address is already linked to an active merchant account.",
        requestId,
        retryable: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const created = await prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.create({
        data: {
          businessName: businessName,
          email,
          password: hashedPassword,
          emailVerified: false,
        },
      });

      if (existingWalletIdentity) {
        await tx.merchantPrivateWalletIdentity.update({
          where: { id: existingWalletIdentity.id },
          data: {
            merchantId: merchant.id,
            isActive: true,
            linkedAt: new Date(),
            unlinkedAt: null,
          },
        });
      } else {
        await tx.merchantPrivateWalletIdentity.create({
          data: {
            merchantId: merchant.id,
            walletAddress,
            isActive: true,
            linkedAt: new Date(),
          },
        });
      }

      return { merchant };
    });

    const verifyToken = await issueMerchantVerificationToken(created.merchant.id);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    await resend.emails.send({
      from: "Kirupay <noreply@kirupay.com>",
      to: email,
      subject: "Action Required: Verify Your Kirupay Account",
      html: `<!DOCTYPE html><html><body><p>Hello ${businessName}, verify your account:</p><a href="${baseUrl}/activate?token=${verifyToken}">Verify</a></body></html>`,
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
