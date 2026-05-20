import { clusterApiUrl, Commitment, Connection } from "@solana/web3.js";

type SolanaCluster = "devnet" | "testnet" | "mainnet-beta";
type SolanaRuntimeTarget = "server" | "client";

type RpcFailoverContext = {
  endpoint: string;
  endpointIndex: number;
  totalEndpoints: number;
};

type RpcFailureLog = {
  operation: string;
  fromEndpoint: string;
  toEndpoint: string;
  reason: string;
};

type RpcTelemetryPayload = {
  operation: string;
  endpoint: string;
  primaryEndpoint: string;
  fallbackEndpoint: string | null;
  failoverFromEndpoint?: string;
  failoverReason?: string;
  timestamp: string;
};

function normalizeCluster(value: string | undefined): SolanaCluster {
  if (value === "mainnet-beta" || value === "testnet" || value === "devnet") return value;
  return "devnet";
}

function getRuntimeEnv(name: string): string | undefined {
  return (process.env[name] || "").trim() || undefined;
}

function getPublicEnv(name: "NEXT_PUBLIC_SOLANA_CLUSTER" | "NEXT_PUBLIC_SOLANA_RPC_PRIMARY" | "NEXT_PUBLIC_SOLANA_RPC_FALLBACK") {
  if (name === "NEXT_PUBLIC_SOLANA_CLUSTER") return process.env.NEXT_PUBLIC_SOLANA_CLUSTER?.trim() || undefined;
  if (name === "NEXT_PUBLIC_SOLANA_RPC_PRIMARY") return process.env.NEXT_PUBLIC_SOLANA_RPC_PRIMARY?.trim() || undefined;
  return process.env.NEXT_PUBLIC_SOLANA_RPC_FALLBACK?.trim() || undefined;
}

function resolveTarget(target?: SolanaRuntimeTarget): SolanaRuntimeTarget {
  if (target) return target;
  return typeof window === "undefined" ? "server" : "client";
}

export function resolveSolanaRpcConfig(target?: SolanaRuntimeTarget) {
  const runtime = resolveTarget(target);
  const cluster =
    runtime === "client"
      ? normalizeCluster(getPublicEnv("NEXT_PUBLIC_SOLANA_CLUSTER"))
      : normalizeCluster(getRuntimeEnv("SOLANA_CLUSTER") || getPublicEnv("NEXT_PUBLIC_SOLANA_CLUSTER"));

  const primary =
    runtime === "client"
      ? getPublicEnv("NEXT_PUBLIC_SOLANA_RPC_PRIMARY") || clusterApiUrl(cluster)
      : getRuntimeEnv("SOLANA_RPC_PRIMARY") || clusterApiUrl(cluster);

  const fallback =
    runtime === "client" ? getPublicEnv("NEXT_PUBLIC_SOLANA_RPC_FALLBACK") : getRuntimeEnv("SOLANA_RPC_FALLBACK");

  const endpoints = [primary, fallback].filter((value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index);

  return {
    runtime,
    cluster,
    primary,
    fallback: fallback ?? null,
    endpoints,
  };
}

export function createSolanaRpcConnections(commitment: Commitment = "confirmed", target?: SolanaRuntimeTarget) {
  const { endpoints } = resolveSolanaRpcConfig(target);
  return endpoints.map((endpoint) => ({ endpoint, connection: new Connection(endpoint, commitment) }));
}

function isRetryableRpcError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("etimedout") ||
    message.includes("econnreset") ||
    message.includes("failed to fetch")
  );
}

function logFailover(event: RpcFailureLog) {
  console.warn("[rpc-failover]", event);
}

function formatErrorReason(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown RPC error";
}

function emitRpcTelemetry(payload: RpcTelemetryPayload) {
  if (typeof window === "undefined") return;

  void fetch("/api/internal/rpc-telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Best effort telemetry only.
  });
}

export async function withRpcFailover<T>(
  operation: string,
  run: (connection: Connection, context: RpcFailoverContext) => Promise<T>,
  options?: { target?: SolanaRuntimeTarget; commitment?: Commitment },
) {
  const config = resolveSolanaRpcConfig(options?.target);
  const connections = createSolanaRpcConnections(options?.commitment ?? "confirmed", options?.target);
  let lastError: unknown;
  let failoverMeta: { fromEndpoint: string; reason: string } | null = null;

  for (let index = 0; index < connections.length; index += 1) {
    const current = connections[index];
    const next = connections[index + 1];

    try {
      const result = await run(current.connection, {
        endpoint: current.endpoint,
        endpointIndex: index,
        totalEndpoints: connections.length,
      });
      emitRpcTelemetry({
        operation,
        endpoint: current.endpoint,
        primaryEndpoint: config.primary,
        fallbackEndpoint: config.fallback,
        failoverFromEndpoint: failoverMeta?.fromEndpoint,
        failoverReason: failoverMeta?.reason,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      lastError = error;
      const canFallback = Boolean(next) && isRetryableRpcError(error);
      if (canFallback && next) {
        const reason = formatErrorReason(error);
        logFailover({
          operation,
          fromEndpoint: current.endpoint,
          toEndpoint: next.endpoint,
          reason,
        });
        failoverMeta = { fromEndpoint: current.endpoint, reason };
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${operation} failed on all configured RPC endpoints`);
}
