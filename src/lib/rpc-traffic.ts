import crypto from "crypto";
import prisma from "@/lib/neon";

export type RpcActiveEndpointType = "PRIMARY" | "FALLBACK" | "UNKNOWN";

export type RpcFailoverSnapshot = {
  id: string;
  operation: string;
  fromEndpointMasked: string;
  toEndpointMasked: string;
  reason: string;
  usedAt: Date;
};

export type RpcTrafficSummary = {
  currentActiveEndpoint: string | null;
  activeEndpointType: RpcActiveEndpointType;
  lastUsedAt: Date | null;
  lastFailoverAt: Date | null;
  lastFailoverReason: string | null;
  recentFailovers: RpcFailoverSnapshot[];
  configError: string | null;
};

type RpcTrafficLogRow = {
  id: string;
  operation: string;
  runtime: string;
  endpointType: "PRIMARY" | "FALLBACK";
  endpointUrlMasked: string;
  usedAt: Date | string;
  failoverFromEndpointMasked: string | null;
  failoverReason: string | null;
};

function isMissingRelationError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const maybe = err as { code?: string; message?: string };
  return maybe.code === "42P01" || (typeof maybe.message === "string" && maybe.message.includes("does not exist"));
}

export function maskRpcEndpoint(url: string) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
    return `${parsed.protocol}//${parsed.host}${path}`;
  } catch {
    return "invalid-endpoint";
  }
}

function toEndpointType(endpoint: string, primary: string, fallback: string | null): "PRIMARY" | "FALLBACK" {
  if (endpoint === primary) return "PRIMARY";
  if (fallback && endpoint === fallback) return "FALLBACK";
  return "PRIMARY";
}

export async function logRpcUsageEvent(input: {
  operation: string;
  runtime: "server" | "client";
  endpoint: string;
  primaryEndpoint: string;
  fallbackEndpoint: string | null;
  usedAt?: Date;
  failoverFromEndpoint?: string;
  failoverReason?: string;
}) {
  const endpointType = toEndpointType(input.endpoint, input.primaryEndpoint, input.fallbackEndpoint);
  const usedAt = input.usedAt ?? new Date();
  const id = crypto.randomUUID();

  await prisma.$executeRaw`
    INSERT INTO "RpcTrafficLog"
    ("id", "operation", "runtime", "endpointType", "endpointUrlMasked", "usedAt", "failoverFromEndpointMasked", "failoverReason", "createdAt")
    VALUES
    (
      ${id},
      ${input.operation},
      ${input.runtime},
      ${endpointType}::"RpcEndpointType",
      ${maskRpcEndpoint(input.endpoint)},
      ${usedAt},
      ${input.failoverFromEndpoint ? maskRpcEndpoint(input.failoverFromEndpoint) : null},
      ${input.failoverReason ?? null},
      now()
    )
  `;
}

export async function getRpcTrafficSummary(): Promise<RpcTrafficSummary> {
  const configuredPrimary = process.env.SOLANA_RPC_PRIMARY?.trim();
  const configError = configuredPrimary ? null : "SOLANA_RPC_PRIMARY is not configured. Server traffic may resolve to cluster default.";

  try {
    const [latestRows, failoverRows] = await Promise.all([
      prisma.$queryRaw<RpcTrafficLogRow[]>`
        SELECT * FROM "RpcTrafficLog" ORDER BY "usedAt" DESC LIMIT 1
      `,
      prisma.$queryRaw<RpcTrafficLogRow[]>`
        SELECT * FROM "RpcTrafficLog"
        WHERE "failoverFromEndpointMasked" IS NOT NULL
        ORDER BY "usedAt" DESC
        LIMIT 10
      `,
    ]);

    const latest = latestRows[0] ?? null;
    const latestFailover = failoverRows[0] ?? null;

    return {
      currentActiveEndpoint: latest?.endpointUrlMasked ?? null,
      activeEndpointType: latest?.endpointType ?? "UNKNOWN",
      lastUsedAt: latest ? new Date(latest.usedAt) : null,
      lastFailoverAt: latestFailover ? new Date(latestFailover.usedAt) : null,
      lastFailoverReason: latestFailover?.failoverReason ?? null,
      recentFailovers: failoverRows.map((row) => ({
        id: row.id,
        operation: row.operation,
        fromEndpointMasked: row.failoverFromEndpointMasked ?? "unknown-endpoint",
        toEndpointMasked: row.endpointUrlMasked,
        reason: row.failoverReason ?? "Unknown RPC error",
        usedAt: new Date(row.usedAt),
      })),
      configError,
    };
  } catch (err) {
    if (isMissingRelationError(err)) {
      return {
        currentActiveEndpoint: null,
        activeEndpointType: "UNKNOWN",
        lastUsedAt: null,
        lastFailoverAt: null,
        lastFailoverReason: null,
        recentFailovers: [],
        configError: "RpcTrafficLog table is not available yet. Run database migrations first.",
      };
    }

    return {
      currentActiveEndpoint: null,
      activeEndpointType: "UNKNOWN",
      lastUsedAt: null,
      lastFailoverAt: null,
      lastFailoverReason: null,
      recentFailovers: [],
      configError: err instanceof Error ? err.message : "Failed to load RPC traffic summary.",
    };
  }
}
