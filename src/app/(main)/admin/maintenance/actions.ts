"use server";

import { getCurrentMerchant } from "@/lib/auth-service";
import {
  DEFAULT_MAINTENANCE_MESSAGE,
  upsertPlatformMaintenanceState,
} from "@/lib/platform-maintenance";
import { confirmTransactionPayment, retryWebhookDelivery } from "@/lib/payment-recovery";
import { runRpcHealthChecks } from "@/lib/rpc-health";
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

function resolveReturnPath(formData?: FormData) {
  const raw = formData?.get("returnTo");
  const value = typeof raw === "string" ? raw : "";
  const allowed = new Set([
    "/admin/maintenance",
    "/admin/maintenance/control",
    "/admin/maintenance/rpc-health",
    "/admin/maintenance/recovery",
  ]);

  if (allowed.has(value)) {
    return value;
  }

  return "/admin/maintenance";
}

function buildMaintenanceRedirectUrl(params: { error?: string; success?: string; returnTo?: string }) {
  const searchParams = new URLSearchParams();
  if (params.error) searchParams.set("error", params.error);
  if (params.success) searchParams.set("success", params.success);
  const basePath = params.returnTo || "/admin/maintenance";
  return `${basePath}?${searchParams.toString()}`;
}

export async function saveMaintenanceSettingsAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const returnTo = resolveReturnPath(formData);
  const enabled = formData.get("enabled") === "on";
  const message = String(formData.get("message") ?? "").trim() || DEFAULT_MAINTENANCE_MESSAGE;
  const maintenanceEndsAt = parseDateTime(formData.get("maintenanceEndsAt"));

  if (formData.get("maintenanceEndsAt") && !maintenanceEndsAt) {
    redirect(buildMaintenanceRedirectUrl({ error: "Invalid maintenance end date.", returnTo }));
  }

  await upsertPlatformMaintenanceState({
    enabled,
    message,
    maintenanceEndsAt,
    updatedById: admin.id,
    updatedByEmail: admin.email,
  });

  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/maintenance/control");
  redirect(buildMaintenanceRedirectUrl({ success: "Maintenance settings updated.", returnTo }));
}

export async function resyncTransactionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const returnTo = resolveReturnPath(formData);

  const transactionId = String(formData.get("transactionId") ?? "").trim();
  const signature = String(formData.get("signature") ?? "").trim();
  const buyerWallet = String(formData.get("buyerWallet") ?? "").trim() || null;
  const walletProvider = String(formData.get("walletProvider") ?? "").trim() || null;

  if (!transactionId) {
    redirect(buildMaintenanceRedirectUrl({ error: "Transaction ID is required.", returnTo }));
  }

  const result = await confirmTransactionPayment({
    transactionId,
    signature: signature || null,
    buyerWallet,
    walletProvider,
  });

  if (!result.success) {
    redirect(buildMaintenanceRedirectUrl({ error: result.error, returnTo }));
  }

  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/maintenance/recovery");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/overview");
  redirect(buildMaintenanceRedirectUrl({ success: "Transaction resynced successfully.", returnTo }));
}

export async function retryWebhookAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const returnTo = resolveReturnPath(formData);

  const logId = String(formData.get("logId") ?? "").trim();

  if (!logId) {
    redirect(buildMaintenanceRedirectUrl({ error: "Webhook log ID is required.", returnTo }));
  }

  const result = await retryWebhookDelivery(logId);

  if (!result.success) {
    redirect(buildMaintenanceRedirectUrl({ error: result.error, returnTo }));
  }

  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/maintenance/recovery");
  revalidatePath("/admin/transactions");
  redirect(buildMaintenanceRedirectUrl({ success: "Webhook retry requested.", returnTo }));
}

export async function runRpcHealthCheckAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const returnTo = resolveReturnPath(formData);

  const result = await runRpcHealthChecks();

  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/maintenance/rpc-health");
  revalidatePath("/admin/overview");

  if (!result.ok) {
    redirect(buildMaintenanceRedirectUrl({ error: result.error, returnTo }));
  }

  redirect(
    buildMaintenanceRedirectUrl({
      success: `RPC health check recorded (${result.results.length} endpoint${result.results.length === 1 ? "" : "s"}).`,
      returnTo,
    })
  );
}
