import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { sign } from "tweetnacl";
import bs58 from "bs58";
import prisma from "@/lib/neon";
import crypto from "crypto";
import { apiError, createRequestId } from "@/lib/api-errors";

function businessCodeFromWallet(publicKey: string) {
  return `biz-${publicKey.slice(0, 6).toLowerCase()}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const { publicKey, signature, message } = await req.json();
    const signatureUint8 = bs58.decode(signature);
    const messageUint8 = new TextEncoder().encode(message);
    const pubKeyUint8 = bs58.decode(publicKey);
    const isValid = sign.detached.verify(messageUint8, signatureUint8, pubKeyUint8);

    if (!isValid) {
      return apiError(401, {
        code: "AUTH_WALLET_SIGNATURE_INVALID",
        message: "Invalid wallet signature.",
        requestId,
        retryable: false,
      });
    }

    const existingIdentity = await prisma.merchantPrivateWalletIdentity.findUnique({
      where: { walletAddress: publicKey },
      include: { merchant: true },
    });

    let merchant = existingIdentity?.merchant;
    let activeBusinessId: string | null = merchant?.activeBusinessId ?? null;

    if (!merchant) {
      const created = await prisma.$transaction(async (tx) => {
        const newMerchant = await tx.merchant.create({
          data: {
            businessName: `User ${publicKey.slice(0, 4)}`,
            email: `${publicKey}@wallet.auth`,
            password: await (await import("bcrypt")).hash(crypto.randomBytes(24).toString("hex"), 12),
            emailVerified: true,
            privateWallets: {
              create: {
                walletAddress: publicKey,
                isActive: true,
                linkedAt: new Date(),
                unlinkedAt: null,
              },
            },
          },
        });

        const business = await tx.businessEntity.create({
          data: {
            name: `Business ${publicKey.slice(0, 4)}`,
            code: businessCodeFromWallet(publicKey),
            contactEmail: newMerchant.email,
          },
        });

        await tx.businessMembership.create({
          data: {
            merchantId: newMerchant.id,
            businessId: business.id,
            role: "OWNER",
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
            walletAddress: publicKey,
            isActive: true,
            linkedAt: new Date(),
          },
        });

        await tx.merchant.update({ where: { id: newMerchant.id }, data: { activeBusinessId: business.id } });

        return { newMerchant, businessId: business.id };
      });

      merchant = created.newMerchant;
      activeBusinessId = created.businessId;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ actorType: "merchant", actorId: merchant.id, wallet: publicKey, activeBusinessId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ success: true, businessId: activeBusinessId, activeBusinessId });
  } catch (error) {
    console.error("Wallet verify error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Authentication failed.",
      requestId,
      retryable: true,
    });
  }
}
