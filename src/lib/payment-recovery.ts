import crypto from "crypto";
import prisma from "@/lib/neon";
import { createMerchantNotification } from "@/lib/merchant-notifications";

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

function isWebhookFailed(statusCode: number | null) {
  return statusCode === null || statusCode < 200 || statusCode >= 300;
}

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
    include: { business: { include: { credentials: true } } },
  });

  if (!existingTx) {
    return { success: false, error: "Transaction not found.", statusCode: 404 };
  }

  if (existingTx.status === "PAID") {
    return {
      success: true,
      transaction: existingTx,
      webhookLogId: null,
    };
  }

  if (existingTx.status !== "PENDING") {
    return {
      success: false,
      error: "This checkout is no longer payable.",
      statusCode: 409,
    };
  }

  if (new Date(existingTx.expiresAt).getTime() <= Date.now()) {
    const updated = await prisma.transaction.updateMany({
      where: {
        id: existingTx.id,
        status: "PENDING",
      },
      data: {
        status: "FAILED",
      },
    });

    if (updated.count > 0) {
      await createMerchantNotification({
        businessId: existingTx.businessId,
        type: "PAYMENT_FAILED",
        source: "PAYMENT",
        severity: "ERROR",
        title: "Payment expired",
        message: `Order ${existingTx.orderId} expired after 30 minutes and is now marked as failed. Create a new checkout to continue.`,
        sourceRefId: existingTx.id,
        metadata: {
          transactionId: existingTx.id,
          orderId: existingTx.orderId,
          amount: existingTx.amount,
          currency: existingTx.currency,
          expiresAt: existingTx.expiresAt,
        },
        dedupMode: "once",
      });
    }

    return {
      success: false,
      error: "Checkout has expired. Please create a new checkout.",
      statusCode: 409,
    };
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

  const updatedTransactions = await prisma.transaction.updateManyAndReturn({
    where: {
      id: input.transactionId,
      status: "PENDING",
    },
    data: {
      status: "PAID",
      txSignature: resolvedSignature,
      buyerWallet: input.buyerWallet || null,
      walletProvider: input.walletProvider || null,
      feeAmount,
      netAmount,
    },
  });
  const paidTransaction = updatedTransactions[0];

  if (!paidTransaction) {
    return {
      success: false,
      error: "Transaction is no longer payable.",
      statusCode: 409,
    };
  }

  const transactionWithBusiness = await prisma.transaction.findUnique({
    where: { id: paidTransaction.id },
    include: { business: { include: { credentials: true } } },
  });

  if (!transactionWithBusiness) {
    return {
      success: false,
      error: "Transaction not found after update.",
      statusCode: 404,
    };
  }

  await createMerchantNotification({
    businessId: transactionWithBusiness.businessId,
    type: "PAYMENT_SUCCESS",
    source: "PAYMENT",
    severity: "INFO",
    title: "Payment confirmed",
    message: `Order ${transactionWithBusiness.orderId} was confirmed and marked as paid.`,
    sourceRefId: transactionWithBusiness.id,
    metadata: {
      transactionId: transactionWithBusiness.id,
      orderId: transactionWithBusiness.orderId,
      amount: transactionWithBusiness.amount,
      currency: transactionWithBusiness.currency,
      status: transactionWithBusiness.status,
      txSignature: transactionWithBusiness.txSignature,
    },
  });

  const webhookUrl = transactionWithBusiness.business.credentials?.webhookUrl ?? null;
  const webhookSecret = transactionWithBusiness.business.credentials?.webhookSecret ?? null;
  let webhookLogId: string | null = null;

  if (webhookUrl) {
    const payloadData = {
      event: "payment.success",
      data: {
        orderId: transactionWithBusiness.orderId,
        transactionId: transactionWithBusiness.id,
        grossAmount: transactionWithBusiness.amount,
        platformFee: transactionWithBusiness.feeAmount,
        netAmount: transactionWithBusiness.netAmount,
        currency: transactionWithBusiness.currency,
        status: transactionWithBusiness.status,
        txSignature: transactionWithBusiness.txSignature,
        buyerWallet: transactionWithBusiness.buyerWallet,
        walletProvider: transactionWithBusiness.walletProvider,
        paidAt: transactionWithBusiness.updatedAt,
      },
    };

    const payloadString = JSON.stringify(payloadData);
    const delivery = await deliverWebhook(payloadString, webhookUrl, webhookSecret);

    try {
      const newLog = await prisma.webhookLog.create({
        data: {
          businessId: transactionWithBusiness.businessId,
          event: "payment.success",
          url: webhookUrl,
          status: delivery.statusCode,
          payload: payloadString,
          response: delivery.responseText,
        },
      });

      webhookLogId = newLog.id;

      if (isWebhookFailed(delivery.statusCode)) {
        await createMerchantNotification({
          businessId: transactionWithBusiness.businessId,
          type: "WEBHOOK_DELIVERY_FAILED",
          source: "WEBHOOK",
          severity: "ERROR",
          title: "Webhook delivery failed",
          message: `Delivery failed for order ${transactionWithBusiness.orderId}. Check webhook logs and retry.`,
          sourceRefId: newLog.id,
          metadata: {
            webhookLogId: newLog.id,
            event: newLog.event,
            statusCode: newLog.status,
            response: newLog.response,
          },
        });
      }
    } catch (dbLogError) {
      console.error("[WEBHOOK] Failed to persist delivery log:", dbLogError);
    }
  }

  return {
    success: true,
    transaction: transactionWithBusiness,
    webhookLogId,
  };
}

export async function retryWebhookDelivery(logId: string) {
  const existingLog = await prisma.webhookLog.findUnique({
    where: { id: logId },
    include: {
      business: {
        include: {
          credentials: {
            select: {
              webhookUrl: true,
              webhookSecret: true,
            },
          },
        },
      },
    },
  });

  if (!existingLog) {
    return { success: false, error: "Webhook log not found.", statusCode: 404 };
  }

  const webhookUrl = existingLog.business.credentials?.webhookUrl ?? null;
  const webhookSecret = existingLog.business.credentials?.webhookSecret ?? null;
  const ownerLabel = existingLog.business.name || existingLog.businessId;

  if (!webhookUrl) {
    return {
      success: false,
      error: `Business ${ownerLabel} has no webhook endpoint configured.`,
      statusCode: 400,
    };
  }

  const delivery = await deliverWebhook(
    existingLog.payload,
    webhookUrl,
    webhookSecret
  );

  const retryLog = await prisma.webhookLog.create({
    data: {
      businessId: existingLog.businessId,
      event: `${existingLog.event}.retry`,
      url: webhookUrl,
      status: delivery.statusCode,
      payload: existingLog.payload,
      response: delivery.responseText,
    },
  });

  if (isWebhookFailed(delivery.statusCode)) {
    await createMerchantNotification({
      businessId: existingLog.businessId,
      type: "WEBHOOK_DELIVERY_FAILED",
      source: "WEBHOOK",
      severity: "ERROR",
      title: "Webhook retry failed",
      message: `Retry for webhook event ${existingLog.event} failed again.`,
      sourceRefId: retryLog.id,
      metadata: {
        webhookLogId: retryLog.id,
        previousLogId: existingLog.id,
        event: retryLog.event,
        statusCode: retryLog.status,
        response: retryLog.response,
      },
    });
  } else {
    await createMerchantNotification({
      businessId: existingLog.businessId,
      type: "WEBHOOK_RECOVERED",
      source: "WEBHOOK",
      severity: "INFO",
      title: "Webhook recovered",
      message: `Retry for webhook event ${existingLog.event} was delivered successfully.`,
      sourceRefId: retryLog.id,
      metadata: {
        webhookLogId: retryLog.id,
        previousLogId: existingLog.id,
        event: retryLog.event,
        statusCode: retryLog.status,
      },
    });
  }

  return {
    success: true,
    retryLogId: retryLog.id,
    statusCode: delivery.statusCode,
  };
}
