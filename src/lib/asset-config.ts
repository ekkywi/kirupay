import { resolveSolanaRpcConfig } from "@/lib/solana-rpc";

export type CheckoutCurrency = "SOL" | "USDC";

type AssetConfig =
  | { currency: "SOL" }
  | {
      currency: "USDC";
      mint: string;
      treasuryAta: string;
      cluster: "devnet" | "testnet" | "mainnet-beta";
    };

function readEnv(key: string) {
  return (process.env[key] || "").trim();
}

function readBoolean(key: string, fallback = false) {
  const value = readEnv(key).toLowerCase();
  if (!value) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

export function isUsdcEnabled() {
  return readBoolean("USDC_ENABLED", true);
}

export function getUsdcAllowedClusters() {
  const raw = readEnv("USDC_ALLOWED_CLUSTERS");
  if (!raw) return ["devnet", "mainnet-beta"] as const;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is "devnet" | "testnet" | "mainnet-beta" => item === "devnet" || item === "testnet" || item === "mainnet-beta");
}

export function isUsdcClusterAllowed(cluster: "devnet" | "testnet" | "mainnet-beta") {
  return getUsdcAllowedClusters().includes(cluster);
}

export function resolveAssetConfig(currency: CheckoutCurrency, target: "server" | "client"): AssetConfig {
  if (currency === "SOL") return { currency: "SOL" };

  if (!isUsdcEnabled()) {
    throw new Error("USDC is disabled by configuration.");
  }

  const cluster = resolveSolanaRpcConfig(target).cluster;

  if (!isUsdcClusterAllowed(cluster)) {
    throw new Error(`USDC is not allowed on cluster ${cluster}.`);
  }

  const mint =
    target === "client"
      ? cluster === "mainnet-beta"
        ? readEnv("NEXT_PUBLIC_USDC_MINT_MAINNET")
        : readEnv("NEXT_PUBLIC_USDC_MINT_DEVNET")
      : cluster === "mainnet-beta"
        ? readEnv("USDC_MINT_MAINNET") || readEnv("NEXT_PUBLIC_USDC_MINT_MAINNET")
        : readEnv("USDC_MINT_DEVNET") || readEnv("NEXT_PUBLIC_USDC_MINT_DEVNET");

  const treasuryAta =
    target === "client"
      ? cluster === "mainnet-beta"
        ? readEnv("NEXT_PUBLIC_TREASURY_USDC_ATA_MAINNET")
        : readEnv("NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET")
      : cluster === "mainnet-beta"
        ? readEnv("TREASURY_USDC_ATA_MAINNET") || readEnv("NEXT_PUBLIC_TREASURY_USDC_ATA_MAINNET")
        : readEnv("TREASURY_USDC_ATA_DEVNET") || readEnv("NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET");

  if (!mint || !treasuryAta) {
    throw new Error(`USDC asset configuration is missing for ${cluster}.`);
  }

  return {
    currency: "USDC",
    mint,
    treasuryAta,
    cluster,
  };
}
