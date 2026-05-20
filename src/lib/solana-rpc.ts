import { clusterApiUrl, Commitment, Connection } from "@solana/web3.js";

type SolanaCluster = "devnet" | "testnet" | "mainnet-beta";

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

function normalizeCluster(value: string | undefined): SolanaCluster {
  if (value === "mainnet-beta" || value === "testnet" || value === "devnet") return value;
  return "devnet";
}

function getRuntimeEnv(name: string): string | undefined {
  return (process.env[name] || "").trim() || undefined;
}

export function resolveSolanaRpcConfig() {
  const cluster = normalizeCluster(getRuntimeEnv("NEXT_PUBLIC_SOLANA_CLUSTER") || getRuntimeEnv("SOLANA_CLUSTER"));

  const primary =
    getRuntimeEnv("NEXT_PUBLIC_SOLANA_RPC_PRIMARY") ||
    getRuntimeEnv("SOLANA_RPC_PRIMARY") ||
    clusterApiUrl(cluster);

  const fallback = getRuntimeEnv("NEXT_PUBLIC_SOLANA_RPC_FALLBACK") || getRuntimeEnv("SOLANA_RPC_FALLBACK");

  const endpoints = [primary, fallback].filter((value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index);

  return {
    cluster,
    primary,
    fallback: fallback ?? null,
    endpoints,
  };
}

export function createSolanaRpcConnections(commitment: Commitment = "confirmed") {
  const { endpoints } = resolveSolanaRpcConfig();
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

export async function withRpcFailover<T>(
  operation: string,
  run: (connection: Connection, context: RpcFailoverContext) => Promise<T>,
) {
  const connections = createSolanaRpcConnections();
  let lastError: unknown;

  for (let index = 0; index < connections.length; index += 1) {
    const current = connections[index];
    const next = connections[index + 1];

    try {
      return await run(current.connection, {
        endpoint: current.endpoint,
        endpointIndex: index,
        totalEndpoints: connections.length,
      });
    } catch (error) {
      lastError = error;
      const canFallback = Boolean(next) && isRetryableRpcError(error);
      if (canFallback && next) {
        logFailover({
          operation,
          fromEndpoint: current.endpoint,
          toEndpoint: next.endpoint,
          reason: formatErrorReason(error),
        });
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${operation} failed on all configured RPC endpoints`);
}
