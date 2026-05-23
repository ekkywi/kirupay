import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";
import { requireMerchantUser } from "@/lib/auth-service";

export async function POST(req: Request) {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "POST /api/merchant/wallet/update");

  try {
    let merchantId = "";
    try {
      const merchant = await requireMerchantUser();
      merchantId = merchant.id;
    } catch {
      recordObservation(obs, { outcome: "error", status: 401, errorCode: "MERCHANT_UNAUTHORIZED" });
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
        recordObservation(obs, { outcome: "error", status: 400, errorCode: "MERCHANT_MISSING_CRYPTO_PROOFS" });
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
        recordObservation(obs, { outcome: "error", status: 401, errorCode: "MERCHANT_WALLET_SIGNATURE_INVALID" });
        return apiError(401, {
          code: "MERCHANT_WALLET_SIGNATURE_INVALID",
          message: "Invalid wallet signature.",
          requestId,
          retryable: false,
        });
      }

      const existingIdentity = await prisma.merchantWalletIdentity.findUnique({ where: { walletAddress: publicKey } });

      if (existingIdentity && existingIdentity.merchantId !== merchantId) {
        recordObservation(obs, { outcome: "error", status: 409, errorCode: "MERCHANT_WALLET_ALREADY_LINKED" });
        return apiError(409, {
          code: "MERCHANT_WALLET_ALREADY_LINKED",
          message: "This wallet is already linked to another merchant account.",
          requestId,
          retryable: false,
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.merchantWalletIdentity.updateMany({
          where: { merchantId, isActive: true },
          data: { isActive: false, unlinkedAt: new Date() },
        });

        if (existingIdentity && existingIdentity.merchantId === merchantId) {
          await tx.merchantWalletIdentity.update({
            where: { walletAddress: publicKey },
            data: { isActive: true, linkedAt: new Date(), unlinkedAt: null },
          });
        } else {
          await tx.merchantWalletIdentity.create({
            data: {
              merchantId,
              walletAddress: publicKey,
              isActive: true,
              linkedAt: new Date(),
              unlinkedAt: null,
            },
          });
        }

        await tx.merchant.update({ where: { id: merchantId }, data: { walletAddress: publicKey } });
      });

      recordObservation(obs, { outcome: "success", status: 200 });
      return NextResponse.json({ message: "Wallet linked successfully", walletAddress: publicKey }, { status: 200 });
    }

    if (action === "unlink") {
      const placeholderWallet = `pending_${Date.now()}_unlinked`;
      const merchant = await prisma.merchant.findUnique({ where: { id: merchantId }, select: { walletAddress: true } });

      await prisma.$transaction(async (tx) => {
        if (merchant?.walletAddress && !merchant.walletAddress.startsWith("pending_")) {
          await tx.merchantWalletIdentity.updateMany({
            where: { merchantId, walletAddress: merchant.walletAddress, isActive: true },
            data: { isActive: false, unlinkedAt: new Date() },
          });
        }

        await tx.merchant.update({ where: { id: merchantId }, data: { walletAddress: placeholderWallet } });
      });

      recordObservation(obs, { outcome: "success", status: 200 });
      return NextResponse.json({ message: "Wallet unlinked successfully", walletAddress: placeholderWallet }, { status: 200 });
    }

    recordObservation(obs, { outcome: "error", status: 400, errorCode: "MERCHANT_INVALID_ACTION" });
    return apiError(400, {
      code: "MERCHANT_INVALID_ACTION",
      message: "Invalid action.",
      requestId,
      retryable: false,
    });
  } catch (error) {
    console.error("Wallet update error", { requestId, error });
    recordObservation(obs, { outcome: "error", status: 500, errorCode: "INTERNAL_SERVER_ERROR" });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
