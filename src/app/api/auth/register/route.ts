import { NextResponse } from "next/server";
import { Resend } from "resend";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { issueMerchantVerificationToken } from "@/lib/email-verification";

function toBusinessCode(name: string) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${normalized || "business"}-${crypto.randomBytes(3).toString("hex")}`;
}

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

    if (existingMerchant || existingWalletIdentity) {
      return apiError(409, {
        code: "AUTH_PROFILE_EMAIL_CONFLICT",
        message: "Merchant with this email or wallet address already exists.",
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
          privateWallets: {
            create: {
              walletAddress,
              isActive: true,
              linkedAt: new Date(),
            },
          },
        },
      });

      const business = await tx.businessEntity.create({
        data: {
          name: businessName,
          code: toBusinessCode(businessName),
          contactEmail: email,
        },
      });

      await tx.businessMembership.create({
        data: {
          merchantId: merchant.id,
          businessId: business.id,
          role: "OWNER",
          isActive: true,
        },
      });

      await tx.businessCredential.create({
        data: {
          businessId: business.id,
          apiKey: `tl_live_${crypto.randomBytes(32).toString("hex")}`,
        },
      });

      await tx.businessWalletIdentity.create({
        data: {
          businessId: business.id,
          walletAddress,
          isActive: true,
          linkedAt: new Date(),
        },
      });

      await tx.merchant.update({ where: { id: merchant.id }, data: { activeBusinessId: business.id } });

      return { merchant, business };
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
