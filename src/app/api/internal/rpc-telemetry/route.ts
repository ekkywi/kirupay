import { NextResponse } from "next/server";
import { logRpcUsageEvent } from "@/lib/rpc-traffic";

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
  try {
    const payload = (await req.json()) as RpcTelemetryPayload;
    const operation = asString(payload.operation);
    const endpoint = asString(payload.endpoint);
    const primaryEndpoint = asString(payload.primaryEndpoint);
    const fallbackEndpointRaw = asString(payload.fallbackEndpoint);

    if (!operation || !endpoint || !primaryEndpoint) {
      return NextResponse.json({ ok: false, error: "Invalid telemetry payload." }, { status: 400 });
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

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to capture RPC telemetry." }, { status: 500 });
  }
}
