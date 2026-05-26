import { afterEach, describe, expect, it } from "vitest";
import { getMissingUsdcConfigKeys, resolveAssetConfig, UsdcConfigError } from "@/lib/asset-config";

const originalEnv = { ...process.env };

describe("USDC asset config guard", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("reports missing client keys for devnet", () => {
    process.env.NEXT_PUBLIC_SOLANA_CLUSTER = "devnet";
    process.env.NEXT_PUBLIC_USDC_MINT_DEVNET = "";
    process.env.NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET = "";

    const missing = getMissingUsdcConfigKeys("devnet", "client");
    expect(missing).toEqual(
      expect.arrayContaining(["NEXT_PUBLIC_USDC_MINT_DEVNET", "NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET"]),
    );
  });

  it("throws structured USDC client config error with missing keys", () => {
    process.env.NEXT_PUBLIC_SOLANA_CLUSTER = "devnet";
    process.env.NEXT_PUBLIC_USDC_MINT_DEVNET = "";
    process.env.NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET = "";

    try {
      resolveAssetConfig("USDC", "client");
      expect.fail("resolveAssetConfig should throw");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(UsdcConfigError);
      const typed = error as UsdcConfigError;
      expect(typed.code).toBe("USDC_CLIENT_CONFIG_MISSING");
      expect(typed.cluster).toBe("devnet");
      expect(typed.missingKeys).toEqual(
        expect.arrayContaining(["NEXT_PUBLIC_USDC_MINT_DEVNET", "NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET"]),
      );
    }
  });

  it("resolves server config using USDC_* keys even without NEXT_PUBLIC_* fallback", () => {
    process.env.SOLANA_CLUSTER = "devnet";
    process.env.USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
    process.env.TREASURY_USDC_ATA_DEVNET = "3xRtxoqcpw3NTH69Mv8HcYoJBDggJTfnUwj69CFGiYQE";
    process.env.NEXT_PUBLIC_USDC_MINT_DEVNET = "";
    process.env.NEXT_PUBLIC_TREASURY_USDC_ATA_DEVNET = "";

    const resolved = resolveAssetConfig("USDC", "server");
    expect(resolved.currency).toBe("USDC");
    expect(resolved.mint).toBe("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
    expect(resolved.treasuryAta).toBe("3xRtxoqcpw3NTH69Mv8HcYoJBDggJTfnUwj69CFGiYQE");
  });
});
