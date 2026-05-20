import { NextResponse } from "next/server";
import { logRpcUsageEvent } from "@/lib/rpc-traffic";
import { apiError, createRequestId } from "@/lib/api-errors";
import { recordObservation, startObservation } from "@/lib/observability";

type RpcTelemetryPayload = {
  operation?: unknown;
  endpoint?: unknown;
  primaryEndpoint?: unknown;
  fallbackEndpoint?: unknown;
  failoverFromEndpoint?: unknown;
  failoverReason?: unknown;
  timestamp?: unknown;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export async function POST(req: Request) {
  const requestId = createRequestId();
  const obs = startObservation(requestId, "POST /api/internal/rpc-telemetry");

  try {
    const payload = (await req.json()) as RpcTelemetryPayload;
    const operation = asString(payload.operation);
    const endpoint = asString(payload.endpoint);
    const primaryEndpoint = asString(payload.primaryEndpoint);
    const fallbackEndpointRaw = asString(payload.fallbackEndpoint);

    if (!operation || !endpoint || !primaryEndpoint) {
      recordObservation(obs, {
        outcome: "error",
        status: 400,
        errorCode: "INTERNAL_RPC_TELEMETRY_INVALID_PAYLOAD",
      });
      return apiError(400, {
        code: "INTERNAL_RPC_TELEMETRY_INVALID_PAYLOAD",
        message: "Invalid telemetry payload.",
        requestId,
        retryable: false,
      });
    }

    await logRpcUsageEvent({
      operation,
      runtime: "client",
      endpoint,
      primaryEndpoint,
      fallbackEndpoint: fallbackEndpointRaw,
      failoverFromEndpoint: asString(payload.failoverFromEndpoint) ?? undefined,
      failoverReason: asString(payload.failoverReason) ?? undefined,
      usedAt: asString(payload.timestamp) ? new Date(asString(payload.timestamp) as string) : new Date(),
    });

    recordObservation(obs, {
      outcome: "success",
      status: 200,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RPC telemetry API error", { requestId, error });
    recordObservation(obs, {
      outcome: "error",
      status: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
    });
    return apiError(500, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to capture RPC telemetry.",
      requestId,
      retryable: true,
    });
  }
}
