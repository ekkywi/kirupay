import { NextResponse } from "next/server";
import { getPlatformMaintenanceState } from "@/lib/platform-maintenance";

type MaintenanceBlockPayload = {
  error: "System under maintenance";
  message: string;
  maintenanceEndsAt: string | null;
};

export async function getPaymentMaintenanceBlock() {
  const maintenance = await getPlatformMaintenanceState();

  if (!maintenance.enabled) {
    return null;
  }

  return {
    status: 503 as const,
    retryAfter: "300",
    payload: {
      error: "System under maintenance" as const,
      message: maintenance.message,
      maintenanceEndsAt: maintenance.maintenanceEndsAt ? maintenance.maintenanceEndsAt.toISOString() : null,
    },
  };
}

export function createMaintenanceJsonResponse(
  block: { status: 503; retryAfter: string; payload: MaintenanceBlockPayload },
  headers?: HeadersInit
) {
  return NextResponse.json(block.payload, {
    status: block.status,
    headers: {
      ...(headers ?? {}),
      "Retry-After": block.retryAfter,
    },
  });
}
