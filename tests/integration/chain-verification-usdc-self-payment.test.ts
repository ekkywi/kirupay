import { beforeEach, describe, expect, it, vi } from "vitest";

const withRpcFailoverMock = vi.fn();
const resolveAssetConfigMock = vi.fn();

vi.mock("@/lib/solana-rpc", () => ({
  withRpcFailover: withRpcFailoverMock,
}));

vi.mock("@/lib/asset-config", () => ({
  resolveAssetConfig: resolveAssetConfigMock,
}));

vi.mock("@solana/web3.js", async () => {
  const actual = await vi.importActual<typeof import("@solana/web3.js")>("@solana/web3.js");
  class MockPublicKey {
    value: string;
    constructor(value: string) {
      this.value = value;
    }
    toBuffer() {
      return Buffer.from(this.value.padEnd(32, "0").slice(0, 32));
    }
    toBase58() {
      return this.value;
    }
    static findProgramAddressSync(seeds: Buffer[]) {
      const owner = seeds[0]?.toString().replace(/\0/g, "") || "";
      const mint = seeds[2]?.toString().replace(/\0/g, "") || "";
      return [new MockPublicKey(`ATA:${owner}:${mint}`), 255] as unknown as ReturnType<typeof actual.PublicKey.findProgramAddressSync>;
    }
  }
  return { ...actual, PublicKey: MockPublicKey };
});

describe("chain verification - usdc self payment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_TREASURY_WALLET = "treasury_wallet_1";
    resolveAssetConfigMock.mockReturnValue({
      currency: "USDC",
      mint: "mint_usdc_devnet",
      treasuryAta: "ATA:treasury_wallet_1:mint_usdc_devnet",
      cluster: "devnet",
    });
  });

  it("rejects when payer ATA equals treasury ATA", async () => {
    withRpcFailoverMock.mockResolvedValue({
      slot: 456,
      blockTime: Math.floor(new Date("2026-01-01T00:10:00.000Z").getTime() / 1000),
      meta: { err: null },
      transaction: {
        message: {
          accountKeys: [{ pubkey: { toBase58: () => "treasury_wallet_1" } }],
          instructions: [],
        },
      },
    });

    const { verifyCheckoutPaymentOnChain } = await import("@/lib/chain-verification");
    const result = await verifyCheckoutPaymentOnChain({
      signature: "sig_self_usdc",
      amount: 1,
      currency: "USDC",
      merchantWallet: "merchant_wallet_1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date("2026-01-01T00:30:00.000Z"),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("CHAIN_TREASURY_SELF_PAYMENT_BLOCKED");
    }
  });
});
