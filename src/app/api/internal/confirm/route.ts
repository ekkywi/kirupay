// src/app/api/internal/confirm/route.ts
import { NextResponse } from "next/server";
import { confirmTransactionPayment } from "@/lib/payment-recovery";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";
import prisma from "@/lib/neon";
import { verifyCheckoutPaymentOnChain } from "@/lib/chain-verification";

export async function POST(req: Request) {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "POST /api/internal/confirm");

  try {
    const body = (await req.json()) as {
      transactionId?: string;
      signature?: string;
      buyerWallet?: string | null;
      walletProvider?: string | null;
    };
    const { transactionId, signature, buyerWallet, walletProvider } = body;

    if (!transactionId || !signature) {
      recordObservation(obs, {
        outcome: "error",
        status: 400,
        errorCode: "INTERNAL_CONFIRMATION_MISSING_FIELDS",
      });
      return apiError(400, {
        code: "INTERNAL_CONFIRMATION_MISSING_FIELDS",
        message: "transactionId and signature are required.",
        requestId,
        retryable: false,
      });
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        business: {
          include: {
            settlementWallets: { where: { isActive: true }, take: 1 },
          },
        },
      },
    });

    if (!tx) {
      recordObservation(obs, {
        outcome: "error",
        status: 404,
        errorCode: "INTERNAL_CONFIRMATION_TX_NOT_FOUND",
      });
      return apiError(404, {
        code: "INTERNAL_CONFIRMATION_TX_NOT_FOUND",
        message: "Transaction not found.",
        requestId,
        retryable: false,
      });
    }

    const merchantWallet = tx.business.settlementWallets[0]?.walletAddress;
    if (!merchantWallet) {
      recordObservation(obs, {
        outcome: "error",
        status: 400,
        errorCode: "INTERNAL_CONFIRMATION_MERCHANT_WALLET_MISSING",
      });
      return apiError(400, {
        code: "INTERNAL_CONFIRMATION_MERCHANT_WALLET_MISSING",
        message: "Merchant settlement wallet is not configured.",
        requestId,
        retryable: false,
      });
    }

    const verification = await verifyCheckoutPaymentOnChain({
      signature,
      amount: tx.amount,
      currency: tx.currency === "USDC" ? "USDC" : "SOL",
      merchantWallet,
      createdAt: tx.createdAt,
      expiresAt: tx.expiresAt,
    });

    if (!verification.ok) {
      recordObservation(obs, {
        outcome: "error",
        status: 409,
        errorCode: verification.code,
      });
      return apiError(409, {
        code: verification.code,
        message: verification.message,
        requestId,
        retryable: false,
      });
    }

    if (buyerWallet && buyerWallet !== verification.buyerWallet) {
      recordObservation(obs, {
        outcome: "error",
        status: 409,
        errorCode: "CHAIN_PAYER_MISMATCH",
      });
      return apiError(409, {
        code: "CHAIN_PAYER_MISMATCH",
        message: "Provided buyer wallet does not match on-chain payer.",
        requestId,
        retryable: false,
      });
    }

    const result = await confirmTransactionPayment({
      transactionId,
      signature,
      buyerWallet: verification.buyerWallet,
      walletProvider: walletProvider || null,
    });

    if (!result.success) {
      recordObservation(obs, {
        outcome: "error",
        status: result.statusCode ?? 400,
        errorCode: "INTERNAL_CONFIRMATION_REJECTED",
      });
      return apiError(result.statusCode ?? 400, {
        code: result.code ?? "INTERNAL_CONFIRMATION_REJECTED",
        message: result.error ?? "Transaction confirmation was rejected.",
        requestId,
        retryable: false,
      });
    }

    recordObservation(obs, {
      outcome: "success",
      status: 200,
    });
    return NextResponse.json({ 
      success: true, 
      message: "Transaction marked as PAID",
      webhookLogId: result.webhookLogId,
      verification: {
        verifiedAt: verification.verifiedAt,
        verifiedSlot: verification.verifiedSlot,
        verificationSource: verification.verificationSource,
      },
      data: result.transaction 
    });

  } catch (error: unknown) {
    console.error("Confirmation API Error", { requestId, error });
    recordObservation(obs, {
      outcome: "error",
      status: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
    });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error.",
      requestId,
      retryable: true,
    });
  }
}
