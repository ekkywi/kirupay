"use server";

import { getCurrentMerchant } from "@/lib/auth-service";
import {
  DEFAULT_MAINTENANCE_MESSAGE,
  upsertPlatformMaintenanceState,
} from "@/lib/platform-maintenance";
import { confirmTransactionPayment, retryWebhookDelivery } from "@/lib/payment-recovery";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const merchant = await getCurrentMerchant();

  if (!merchant || merchant.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return merchant;
}

function parseDateTime(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function buildMaintenanceRedirectUrl(params: { error?: string; success?: string }) {
  const searchParams = new URLSearchParams();
  if (params.error) searchParams.set("error", params.error);
  if (params.success) searchParams.set("success", params.success);
  return `/admin/maintenance?${searchParams.toString()}`;
}

export async function saveMaintenanceSettingsAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const enabled = formData.get("enabled") === "on";
  const message = String(formData.get("message") ?? "").trim() || DEFAULT_MAINTENANCE_MESSAGE;
  const maintenanceEndsAt = parseDateTime(formData.get("maintenanceEndsAt"));

  if (formData.get("maintenanceEndsAt") && !maintenanceEndsAt) {
    redirect(buildMaintenanceRedirectUrl({ error: "Invalid maintenance end date." }));
  }

  await upsertPlatformMaintenanceState({
    enabled,
    message,
    maintenanceEndsAt,
    updatedById: admin.id,
    updatedByEmail: admin.email,
  });

  revalidatePath("/admin/maintenance");
  redirect(buildMaintenanceRedirectUrl({ success: "Maintenance settings updated." }));
}

export async function resyncTransactionAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const signature = String(formData.get("signature") ?? "").trim();
  const buyerWallet = String(formData.get("buyerWallet") ?? "").trim() || null;
  const walletProvider = String(formData.get("walletProvider") ?? "").trim() || null;

  if (!transactionId) {
    redirect(buildMaintenanceRedirectUrl({ error: "Transaction ID is required." }));
  }

  const result = await confirmTransactionPayment({
    transactionId,
    signature: signature || null,
    buyerWallet,
    walletProvider,
  });

  if (!result.success) {
    redirect(buildMaintenanceRedirectUrl({ error: result.error }));
  }

  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/overview");
  redirect(buildMaintenanceRedirectUrl({ success: "Transaction resynced successfully." }));
}

export async function retryWebhookAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const logId = String(formData.get("logId") ?? "").trim();

  if (!logId) {
    redirect(buildMaintenanceRedirectUrl({ error: "Webhook log ID is required." }));
  }

  const result = await retryWebhookDelivery(logId);

  if (!result.success) {
    redirect(buildMaintenanceRedirectUrl({ error: result.error }));
  }

  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/transactions");
  redirect(buildMaintenanceRedirectUrl({ success: "Webhook retry requested." }));
}
