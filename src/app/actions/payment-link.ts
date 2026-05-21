// src/app/actions/payment-link.ts
"use server";

import prisma from "@/lib/neon";
import { getPaymentMaintenanceBlock } from "@/lib/maintenance-policy";
import { revalidatePath } from "next/cache";
import { createRequestId, errorDocsUrl, type ApiErrorCode } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";

type ManualLinkActionResult =
  | { success: true; transactionId: string }
  | {
      success: false;
      error: string;
      statusCode: number;
      diagnostics: {
        code: ApiErrorCode;
        requestId: string;
        docsUrl: string;
        retryable: boolean;
      };
    };

export async function createManualPaymentLink(formData: {
  merchantId: string;
  amount: number;
  orderId?: string;
  customerEmail?: string;
  customerReference?: string;
  customerName?: string;
  notes?: string;
}): Promise<ManualLinkActionResult> {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "action:createManualPaymentLink");

  const fail = (
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    retryable: boolean,
  ): ManualLinkActionResult => {
    recordObservation(obs, {
      event: "server.action",
      outcome: "error",
      status: statusCode,
      errorCode: code,
    });

    return {
      success: false,
      error: message,
      statusCode,
      diagnostics: {
        code,
        requestId,
        docsUrl: errorDocsUrl(code),
        retryable,
      },
    };
  };

  try {
    const maintenanceBlock = await getPaymentMaintenanceBlock();
    if (maintenanceBlock) {
      return fail(
        maintenanceBlock.status,
        "MAINTENANCE_MODE_ACTIVE",
        maintenanceBlock.payload.message,
        true,
      );
    }

    let finalOrderId = formData.orderId;

    if (finalOrderId) {
      const existing = await prisma.transaction.findFirst({
        where: {
          merchantId: formData.merchantId,
          orderId: finalOrderId,
        }
      });

      if (existing) {
        return fail(
          409,
          "CHECKOUT_DUPLICATE_ORDER_ID",
          `Order ID '${finalOrderId}' is already used. Please use a unique ID or leave it blank.`,
          false,
        );
      }
    } else {
      finalOrderId = `TZL-LINK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }

    const transaction = await prisma.transaction.create({
      data: {
        merchantId: formData.merchantId,
        orderId: finalOrderId,
        amount: formData.amount,
        currency: "SOL",
        customerEmail: formData.customerEmail || null,
        customerReference: formData.customerReference?.trim() || null,
        customerName: formData.customerName?.trim() || null,
        notes: formData.notes?.trim() || null,
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard/payment-links");
    recordObservation(obs, {
      event: "server.action",
      outcome: "success",
      status: 200,
    });
    return { success: true, transactionId: transaction.id };
  } catch (error) {
    console.error("Manual payment link action error", { requestId, error });
    return fail(500, "INTERNAL_SERVER_ERROR", "Failed to create payment link. Internal server error.", true);
  }
}
