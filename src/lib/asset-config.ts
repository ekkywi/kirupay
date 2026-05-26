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

type SolanaCluster = "devnet" | "testnet" | "mainnet-beta";
type AssetTarget = "server" | "client";
type UsdcResolvedConfig = { mint: string; treasuryAta: string; missingKeys: string[] };

export class UsdcConfigError extends Error {
  code:
    | "USDC_DISABLED"
    | "USDC_CLUSTER_NOT_ALLOWED"
    | "USDC_ASSET_CONFIG_MISSING"
    | "USDC_CLIENT_CONFIG_MISSING";
  cluster: SolanaCluster;
  missingKeys?: string[];

  constructor(
    code: UsdcConfigError["code"],
    message: string,
    cluster: SolanaCluster,
    options?: { missingKeys?: string[] },
  ) {
    super(message);
    this.name = "UsdcConfigError";
    this.code = code;
    this.cluster = cluster;
    this.missingKeys = options?.missingKeys;
  }
}

function readRuntimeEnv(name: "USDC_ENABLED" | "USDC_ALLOWED_CLUSTERS") {
  if (name === "USDC_ENABLED") return process.env.USDC_ENABLED?.trim() || "";
  return process.env.USDC_ALLOWED_CLUSTERS?.trim() || "";
}

function readBoolean(name: "USDC_ENABLED", fallback = false) {
  const value = readRuntimeEnv(name).toLowerCase();
  if (!value) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

export function isUsdcEnabled() {
  return readBoolean("USDC_ENABLED", true);
}

export function getUsdcAllowedClusters() {
  const raw = readRuntimeEnv("USDC_ALLOWED_CLUSTERS");
  if (!raw) return ["devnet", "mainnet-beta"] as const;
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is "devnet" | "testnet" | "mainnet-beta" => item === "devnet" || item === "testnet" || item === "mainnet-beta");
}

export function isUsdcClusterAllowed(cluster: "devnet" | "testnet" | "mainnet-beta") {
  return getUsdcAllowedClusters().includes(cluster);
}

function readClientUsdcConfig(cluster: SolanaCluster): UsdcResolvedConfig {
  if (cluster === "mainnet-beta") {
    const mint = process.env.NEXT_PUBLIC_USDC_MINT_MAINNET?.trim() || "";
    const treasuryAta = process.env.NEXT_PUBLIC_TREASURY_USDC_ATA_MAINNET?.trim() || "";
    const missingKeys = [
      ...(!mint ? ["NEXT_PUBLIC_USDC_MINT_MAINNET"] : []),
      ...(!treasuryAta ? ["NEXT_PUBLIC_TREASURY_USDC_ATA_MAINNET"] : []),
    ];
    return { mint, treasuryAta, missingKeys };
  }

  const mint = process.env.NEXT_PUBLIC_USDC_MINT_DEVNET?.trim() || "";
  const treasuryAta = process.env.NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET?.trim() || "";
  const missingKeys = [
    ...(!mint ? ["NEXT_PUBLIC_USDC_MINT_DEVNET"] : []),
    ...(!treasuryAta ? ["NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET"] : []),
  ];
  return { mint, treasuryAta, missingKeys };
}

function readServerUsdcConfig(cluster: SolanaCluster): UsdcResolvedConfig {
  if (cluster === "mainnet-beta") {
    const mintServer = process.env.USDC_MINT_MAINNET?.trim() || "";
    const treasuryServer = process.env.TREASURY_USDC_ATA_MAINNET?.trim() || "";
    const mintPublic = process.env.NEXT_PUBLIC_USDC_MINT_MAINNET?.trim() || "";
    const treasuryPublic = process.env.NEXT_PUBLIC_TREASURY_USDC_ATA_MAINNET?.trim() || "";
    const mint = mintServer || mintPublic;
    const treasuryAta = treasuryServer || treasuryPublic;
    const missingKeys = [
      ...(!mint ? ["USDC_MINT_MAINNET", "NEXT_PUBLIC_USDC_MINT_MAINNET"] : []),
      ...(!treasuryAta ? ["TREASURY_USDC_ATA_MAINNET", "NEXT_PUBLIC_TREASURY_USDC_ATA_MAINNET"] : []),
    ];
    return { mint, treasuryAta, missingKeys };
  }

  const mintServer = process.env.USDC_MINT_DEVNET?.trim() || "";
  const treasuryServer = process.env.TREASURY_USDC_ATA_DEVNET?.trim() || "";
  const mintPublic = process.env.NEXT_PUBLIC_USDC_MINT_DEVNET?.trim() || "";
  const treasuryPublic = process.env.NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET?.trim() || "";
  const mint = mintServer || mintPublic;
  const treasuryAta = treasuryServer || treasuryPublic;
  const missingKeys = [
    ...(!mint ? ["USDC_MINT_DEVNET", "NEXT_PUBLIC_USDC_MINT_DEVNET"] : []),
    ...(!treasuryAta ? ["TREASURY_USDC_ATA_DEVNET", "NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET"] : []),
  ];
  return { mint, treasuryAta, missingKeys };
}

export function getMissingUsdcConfigKeys(cluster: SolanaCluster, target: AssetTarget) {
  return target === "client"
    ? readClientUsdcConfig(cluster).missingKeys
    : readServerUsdcConfig(cluster).missingKeys;
}

export function resolveAssetConfig(currency: CheckoutCurrency, target: AssetTarget): AssetConfig {
  if (currency === "SOL") return { currency: "SOL" };
  const cluster = resolveSolanaRpcConfig(target).cluster;

  if (!isUsdcEnabled()) {
    throw new UsdcConfigError("USDC_DISABLED", "USDC is disabled by configuration.", cluster);
  }

  if (!isUsdcClusterAllowed(cluster)) {
    throw new UsdcConfigError("USDC_CLUSTER_NOT_ALLOWED", `USDC is not allowed on cluster ${cluster}.`, cluster);
  }

  const missingKeys = getMissingUsdcConfigKeys(cluster, target);
  if (missingKeys.length > 0) {
    const errorCode = target === "client" ? "USDC_CLIENT_CONFIG_MISSING" : "USDC_ASSET_CONFIG_MISSING";
    throw new UsdcConfigError(
      errorCode,
      `USDC asset configuration is missing for ${cluster}.`,
      cluster,
      { missingKeys },
    );
  }

  const resolved = target === "client" ? readClientUsdcConfig(cluster) : readServerUsdcConfig(cluster);
  const mint = resolved.mint;
  const treasuryAta = resolved.treasuryAta;

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
