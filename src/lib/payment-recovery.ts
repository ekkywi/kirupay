import crypto from "crypto";
import prisma from "@/lib/neon";

const PLATFORM_FEE_RATE = 0.003;

type ConfirmTransactionInput = {
  transactionId: string;
  signature?: string | null;
  buyerWallet?: string | null;
  walletProvider?: string | null;
};

type WebhookDeliveryResult = {
  statusCode: number | null;
  responseText: string | null;
};

async function deliverWebhook(payloadString: string, webhookUrl: string, webhookSecret?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (webhookSecret) {
    const hmacSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payloadString)
      .digest("hex");

    headers["X-Trezalink-Signature"] = hmacSignature;
  }

  let statusCode: number | null = null;
  let responseText: string | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    statusCode = response.status;
    const rawText = await response.text();
    responseText = rawText ? rawText.substring(0, 1000) : "No Response Body";
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection Failed / Timeout";
    statusCode = null;
    responseText = message;
    console.error(`[WEBHOOK] Failed to deliver to ${webhookUrl}:`, message);
  }

  return {
    statusCode,
    responseText,
  } satisfies WebhookDeliveryResult;
}

export async function confirmTransactionPayment(input: ConfirmTransactionInput) {
  const existingTx = await prisma.transaction.findUnique({
    where: { id: input.transactionId },
    include: { merchant: true },
  });

  if (!existingTx) {
    return { success: false, error: "Transaction not found.", statusCode: 404 };
  }

  const resolvedSignature = input.signature?.trim() || existingTx.txSignature || null;
  if (!resolvedSignature) {
    return {
      success: false,
      error: "Signature is missing. Provide blockchain signature or save it on the transaction first.",
      statusCode: 400,
    };
  }

  const grossAmount = existingTx.amount;
  const feeAmount = grossAmount * PLATFORM_FEE_RATE;
  const netAmount = grossAmount - feeAmount;

  const updatedTransaction = await prisma.transaction.update({
    where: { id: input.transactionId },
    data: {
      status: "PAID",
      txSignature: resolvedSignature,
      buyerWallet: input.buyerWallet || null,
      walletProvider: input.walletProvider || null,
      feeAmount,
      netAmount,
    },
    include: {
      merchant: true,
    },
  });

  const webhookUrl = updatedTransaction.merchant.webhookUrl;
  const webhookSecret = updatedTransaction.merchant.webhookSecret;
  let webhookLogId: string | null = null;

  if (webhookUrl) {
    const payloadData = {
      event: "payment.success",
      data: {
        orderId: updatedTransaction.orderId,
        transactionId: updatedTransaction.id,
        grossAmount: updatedTransaction.amount,
        platformFee: updatedTransaction.feeAmount,
        netAmount: updatedTransaction.netAmount,
        currency: updatedTransaction.currency,
        status: updatedTransaction.status,
        txSignature: updatedTransaction.txSignature,
        buyerWallet: updatedTransaction.buyerWallet,
        walletProvider: updatedTransaction.walletProvider,
        paidAt: updatedTransaction.updatedAt,
      },
    };

    const payloadString = JSON.stringify(payloadData);
    const delivery = await deliverWebhook(payloadString, webhookUrl, webhookSecret);

    try {
      const newLog = await prisma.webhookLog.create({
        data: {
          merchantId: updatedTransaction.merchantId,
          event: "payment.success",
          url: webhookUrl,
          status: delivery.statusCode,
          payload: payloadString,
          response: delivery.responseText,
        },
      });

      webhookLogId = newLog.id;
    } catch (dbLogError) {
      console.error("[WEBHOOK] Failed to persist delivery log:", dbLogError);
    }
  }

  return {
    success: true,
    transaction: updatedTransaction,
    webhookLogId,
  };
}

export async function retryWebhookDelivery(logId: string) {
  const existingLog = await prisma.webhookLog.findUnique({
    where: { id: logId },
    include: {
      merchant: {
        select: {
          webhookUrl: true,
          webhookSecret: true,
          businessName: true,
        },
      },
    },
  });

  if (!existingLog) {
    return { success: false, error: "Webhook log not found.", statusCode: 404 };
  }

  if (!existingLog.merchant.webhookUrl) {
    return {
      success: false,
      error: `Merchant ${existingLog.merchant.businessName} has no webhook endpoint configured.`,
      statusCode: 400,
    };
  }

  const delivery = await deliverWebhook(
    existingLog.payload,
    existingLog.merchant.webhookUrl,
    existingLog.merchant.webhookSecret
  );

  const retryLog = await prisma.webhookLog.create({
    data: {
      merchantId: existingLog.merchantId,
      event: `${existingLog.event}.retry`,
      url: existingLog.merchant.webhookUrl,
      status: delivery.statusCode,
      payload: existingLog.payload,
      response: delivery.responseText,
    },
  });

  return {
    success: true,
    retryLogId: retryLog.id,
    statusCode: delivery.statusCode,
  };
}
