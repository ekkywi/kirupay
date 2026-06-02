// src/app/actions/payment-link.ts
"use server";

import prisma from "@/lib/neon";
import { getPaymentMaintenanceBlock } from "@/lib/maintenance-policy";
import { revalidatePath } from "next/cache";
import { createRequestId, errorDocsUrl, type ApiErrorCode } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";
import { DEFAULT_PAYMENT_CURRENCY, isSupportedPaymentCurrency, type PaymentCurrency } from "@/lib/payment-currencies";
import { getMissingUsdcConfigKeys, resolveAssetConfig, UsdcConfigError } from "@/lib/asset-config";
import { resolveSolanaRpcConfig } from "@/lib/solana-rpc";

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
  businessId: string;
  amount: number;
  currency?: string;
  orderId?: string;
  customerEmail?: string;
  customerReference?: string;
  customerName?: string;
  notes?: string;
}): Promise<ManualLinkActionResult> {
  const CHECKOUT_TTL_MS = 30 * 60 * 1000;
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

    const rawCurrency = formData.currency?.trim();
    if (rawCurrency && !isSupportedPaymentCurrency(rawCurrency)) {
      return fail(
        400,
        "CHECKOUT_VALIDATION_FAILED",
        "Supported currencies: SOL, USDC.",
        false,
      );
    }

    const currency: PaymentCurrency = rawCurrency && isSupportedPaymentCurrency(rawCurrency)
      ? rawCurrency
      : DEFAULT_PAYMENT_CURRENCY;

    if (!Number.isFinite(formData.amount) || formData.amount <= 0) {
      return fail(
        400,
        "CHECKOUT_VALIDATION_FAILED",
        "Amount must be a positive number.",
        false,
      );
    }

    if (currency === "USDC") {
      const clientCluster = resolveSolanaRpcConfig("client").cluster;
      const missingClientKeys = getMissingUsdcConfigKeys(clientCluster, "client");
      if (missingClientKeys.length > 0) {
        return fail(
          400,
          "USDC_CLIENT_CONFIG_MISSING",
          "USDC checkout client configuration is missing. Please set required NEXT_PUBLIC USDC variables.",
          false,
        );
      }

      try {
        resolveAssetConfig("USDC", "server");
      } catch (error: unknown) {
        if (error instanceof UsdcConfigError) {
          return fail(
            500,
            "USDC_ASSET_CONFIG_MISSING",
            "USDC checkout server configuration is missing for the active network.",
            false,
          );
        }
        return fail(
          500,
          "INTERNAL_SERVER_ERROR",
          "USDC checkout is not configured for the active network.",
          false,
        );
      }
    }

    let finalOrderId = formData.orderId;

    if (finalOrderId) {
      const existing = await prisma.transaction.findFirst({
        where: {
          businessId: formData.businessId,
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

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CHECKOUT_TTL_MS);
    const transaction = await prisma.transaction.create({
      data: {
        businessId: formData.businessId,
        orderId: finalOrderId,
        amount: formData.amount,
        currency,
        customerEmail: formData.customerEmail || null,
        customerReference: formData.customerReference?.trim() || null,
        customerName: formData.customerName?.trim() || null,
        notes: formData.notes?.trim() || null,
        status: "PENDING",
        createdAt: now,
        expiresAt,
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
