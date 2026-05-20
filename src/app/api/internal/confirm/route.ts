// src/app/api/internal/confirm/route.ts
import { NextResponse } from "next/server";
import { confirmTransactionPayment } from "@/lib/payment-recovery";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";

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

    const result = await confirmTransactionPayment({
      transactionId,
      signature,
      buyerWallet: buyerWallet || null,
      walletProvider: walletProvider || null,
    });

    if (!result.success) {
      recordObservation(obs, {
        outcome: "error",
        status: result.statusCode ?? 400,
        errorCode: "INTERNAL_CONFIRMATION_REJECTED",
      });
      return apiError(result.statusCode ?? 400, {
        code: "INTERNAL_CONFIRMATION_REJECTED",
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
