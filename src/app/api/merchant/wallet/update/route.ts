import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import bs58 from "bs58";
import prisma from "@/lib/neon";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";
import { requireBusinessMembership } from "@/lib/auth-service";

function mapAccessError(error: unknown): { status: 401 | 403; code: "MERCHANT_UNAUTHORIZED" | "MERCHANT_FORBIDDEN"; message: string } {
  if (error instanceof Error && error.message === "Forbidden") {
    return { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." };
  }
  return { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." };
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "POST /api/merchant/wallet/update");

  try {
    let ctx;
    try {
      ctx = await requireBusinessMembership({ roles: ["OWNER", "ADMIN"] });
    } catch (error) {
      const accessError = mapAccessError(error);
      recordObservation(obs, { outcome: "error", status: accessError.status, errorCode: accessError.code });
      return apiError(accessError.status, {
        code: accessError.code,
        message: accessError.message,
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

      const existingIdentity = await prisma.businessWalletIdentity.findUnique({ where: { walletAddress: publicKey } });

      if (existingIdentity && existingIdentity.businessId !== ctx.business.id) {
        recordObservation(obs, { outcome: "error", status: 409, errorCode: "MERCHANT_WALLET_ALREADY_LINKED" });
        return apiError(409, {
          code: "MERCHANT_WALLET_ALREADY_LINKED",
          message: "This wallet is already linked to another business account.",
          requestId,
          retryable: false,
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.businessWalletIdentity.updateMany({
          where: { businessId: ctx.business.id, isActive: true },
          data: { isActive: false, unlinkedAt: new Date() },
        });

        if (existingIdentity && existingIdentity.businessId === ctx.business.id) {
          await tx.businessWalletIdentity.update({
            where: { walletAddress: publicKey },
            data: { isActive: true, linkedAt: new Date(), unlinkedAt: null },
          });
        } else {
          await tx.businessWalletIdentity.create({
            data: {
              businessId: ctx.business.id,
              walletAddress: publicKey,
              isActive: true,
              linkedAt: new Date(),
              unlinkedAt: null,
            },
          });
        }
      });

      recordObservation(obs, { outcome: "success", status: 200 });
      return NextResponse.json({ message: "Wallet linked successfully", walletAddress: publicKey }, { status: 200 });
    }

    if (action === "unlink") {
      await prisma.businessWalletIdentity.updateMany({
        where: { businessId: ctx.business.id, isActive: true },
        data: { isActive: false, unlinkedAt: new Date() },
      });

      recordObservation(obs, { outcome: "success", status: 200 });
      return NextResponse.json({ message: "Wallet unlinked successfully", walletAddress: null }, { status: 200 });
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
