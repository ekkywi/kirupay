import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { getCurrentMerchant } from "@/lib/auth-service";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return apiError(401, {
        code: "MERCHANT_UNAUTHORIZED",
        message: "Unauthorized.",
        requestId,
        retryable: false,
      });
    }

    const { action, publicKey, signature, message } = await req.json();

    if (action === "link") {
      if (!publicKey || !signature || !message) {
        return apiError(400, {
          code: "MERCHANT_MISSING_CRYPTO_PROOFS",
          message: "Missing cryptographic proofs.",
          requestId,
          retryable: false,
        });
      }

      const messageUint8 = new TextEncoder().encode(message);
      const signatureUint8 = bs58.decode(signature);
      const publicKeyUint8 = bs58.decode(publicKey);
      const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);

      if (!isValid) {
        return apiError(401, {
          code: "MERCHANT_WALLET_SIGNATURE_INVALID",
          message: "Invalid wallet signature.",
          requestId,
          retryable: false,
        });
      }

      const existingIdentity = await prisma.merchantPrivateWalletIdentity.findUnique({
        where: { walletAddress: publicKey },
      });

      if (existingIdentity && existingIdentity.merchantId !== merchant.id && existingIdentity.isActive) {
        return apiError(409, {
          code: "MERCHANT_WALLET_ALREADY_LINKED",
          message: "This wallet is already linked to another merchant account.",
          requestId,
          retryable: false,
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.merchantPrivateWalletIdentity.updateMany({
          where: { merchantId: merchant.id, isActive: true },
          data: { isActive: false, unlinkedAt: new Date() },
        });

        if (existingIdentity) {
          await tx.merchantPrivateWalletIdentity.update({
            where: { walletAddress: publicKey },
            data: {
              merchantId: merchant.id,
              isActive: true,
              linkedAt: new Date(),
              unlinkedAt: null,
            },
          });
          return;
        }

        await tx.merchantPrivateWalletIdentity.create({
          data: {
            merchantId: merchant.id,
            walletAddress: publicKey,
            isActive: true,
            linkedAt: new Date(),
            unlinkedAt: null,
          },
        });
      });

      return NextResponse.json({ message: "Personal wallet linked successfully", walletAddress: publicKey }, { status: 200 });
    }

    if (action === "unlink") {
      await prisma.merchantPrivateWalletIdentity.updateMany({
        where: { merchantId: merchant.id, isActive: true },
        data: { isActive: false, unlinkedAt: new Date() },
      });

      return NextResponse.json({ message: "Personal wallet unlinked successfully", walletAddress: null }, { status: 200 });
    }

    return apiError(400, {
      code: "MERCHANT_INVALID_ACTION",
      message: "Invalid action.",
      requestId,
      retryable: false,
    });
  } catch (error) {
    console.error("Personal wallet update error", { requestId, error });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
