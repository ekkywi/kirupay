// src/app/actions/payment-link.ts
"use server";

import prisma from "@/lib/neon";
import { getPaymentMaintenanceBlock } from "@/lib/maintenance-policy";
import { revalidatePath } from "next/cache";

export async function createManualPaymentLink(formData: {
  merchantId: string;
  amount: number;
  orderId?: string;
  customerEmail?: string;
}) {
  try {
    const maintenanceBlock = await getPaymentMaintenanceBlock();
    if (maintenanceBlock) {
      return {
        success: false,
        error: maintenanceBlock.payload.message,
        statusCode: maintenanceBlock.status,
      };
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
        return { 
          success: false, 
          error: `Order ID '${finalOrderId}' is already used. Please use a unique ID or leave it blank.` 
        };
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
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard/payment-links");
    return { success: true, transactionId: transaction.id };
  } catch {
    return { success: false, error: "Failed to create payment link. Internal server error." };
  }
}
