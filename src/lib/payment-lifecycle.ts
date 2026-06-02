import prisma from "@/lib/neon";
import { createMerchantNotification } from "@/lib/merchant-notifications";

const PENDING_WARNING_MS = 20 * 60 * 1000;
export async function evaluatePaymentLifecycle(now = new Date()) {
  const warningThreshold = new Date(now.getTime() - PENDING_WARNING_MS);

  const warningCandidates = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
      createdAt: { lte: warningThreshold },
      expiresAt: { gt: now },
    },
    select: {
      id: true,
      businessId: true,
      orderId: true,
      amount: true,
      currency: true,
      expiresAt: true,
    },
    take: 500,
    orderBy: { createdAt: "asc" },
  });

  let warned = 0;
  for (const tx of warningCandidates) {
    const result = await createMerchantNotification({
      businessId: tx.businessId,
      type: "PAYMENT_PENDING_TOO_LONG",
      source: "PAYMENT",
      severity: "WARNING",
      title: "Payment still pending",
      message: `Order ${tx.orderId} is still pending after 20 minutes. It will fail automatically at 30 minutes.`,
      sourceRefId: tx.id,
      metadata: {
        transactionId: tx.id,
        orderId: tx.orderId,
        amount: tx.amount,
        currency: tx.currency,
        expiresAt: tx.expiresAt,
      },
      dedupMode: "once",
    });

    if (result.created) warned += 1;
  }

  const expiredCandidates = await prisma.transaction.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lte: now },
    },
    select: {
      id: true,
      businessId: true,
      orderId: true,
      amount: true,
      currency: true,
      expiresAt: true,
    },
    take: 500,
    orderBy: { expiresAt: "asc" },
  });

  let failed = 0;
  let failureNotifications = 0;

  for (const tx of expiredCandidates) {
    const updated = await prisma.transaction.updateMany({
      where: {
        id: tx.id,
        status: "PENDING",
      },
      data: {
        status: "FAILED",
      },
    });

    if (updated.count === 0) continue;

    failed += 1;

    const result = await createMerchantNotification({
      businessId: tx.businessId,
      type: "PAYMENT_FAILED",
      source: "PAYMENT",
      severity: "ERROR",
      title: "Payment expired",
      message: `Order ${tx.orderId} expired after 30 minutes and is now marked as failed. Create a new checkout to continue.`,
      sourceRefId: tx.id,
      metadata: {
        transactionId: tx.id,
        orderId: tx.orderId,
        amount: tx.amount,
        currency: tx.currency,
        expiresAt: tx.expiresAt,
      },
      dedupMode: "once",
    });

    if (result.created) {
      failureNotifications += 1;
    }
  }

  return {
    checkedAt: now.toISOString(),
    warningCandidates: warningCandidates.length,
    warned,
    expiredCandidates: expiredCandidates.length,
    failed,
    failureNotifications,
  };
}
