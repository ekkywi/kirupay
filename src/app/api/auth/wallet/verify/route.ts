import { NextResponse } from "next/server";
import { sign } from "tweetnacl";
import bs58 from "bs58";
import prisma from "@/lib/neon";
import crypto from "crypto";
import { apiError, createRequestId } from "@/lib/api-errors";
import { setMerchantSessionToken } from "@/lib/merchant-session";

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

    if (existingIdentity?.isActive && existingIdentity.merchant.isActive === false) {
      return apiError(409, {
        code: "MERCHANT_WALLET_ALREADY_LINKED",
        message: "This wallet is currently linked to an inactive merchant account and must be reclaimed through account recovery.",
        requestId,
        retryable: false,
      });
    }

    let merchant = existingIdentity?.isActive ? existingIdentity.merchant : null;
    let activeBusinessId: string | null = merchant?.activeBusinessId ?? null;

    if (!merchant) {
      const created = await prisma.$transaction(async (tx) => {
        const newMerchant = await tx.merchant.create({
          data: {
            businessName: `User ${publicKey.slice(0, 4)}`,
            email: `${publicKey}@wallet.auth`,
            password: await (await import("bcrypt")).hash(crypto.randomBytes(24).toString("hex"), 12),
            emailVerified: true,
          },
        });

        if (existingIdentity) {
          await tx.merchantPrivateWalletIdentity.update({
            where: { id: existingIdentity.id },
            data: {
              merchantId: newMerchant.id,
              isActive: true,
              linkedAt: new Date(),
              unlinkedAt: null,
            },
          });
        } else {
          await tx.merchantPrivateWalletIdentity.create({
            data: {
              merchantId: newMerchant.id,
              walletAddress: publicKey,
              isActive: true,
              linkedAt: new Date(),
              unlinkedAt: null,
            },
          });
        }

        return newMerchant;
      });

      merchant = created;
      activeBusinessId = null;
    }

    if (!activeBusinessId) {
      const firstMembership = await prisma.businessMembership.findFirst({
        where: {
          merchantId: merchant.id,
          isActive: true,
          business: { isActive: true },
        },
        orderBy: { createdAt: "asc" },
      });

      if (firstMembership) {
        activeBusinessId = firstMembership.businessId;
        await prisma.merchant.update({
          where: { id: merchant.id },
          data: { activeBusinessId },
        });
      }
    }

    await setMerchantSessionToken({
      actorId: merchant.id,
      email: merchant.email,
      activeBusinessId,
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
