import { beforeEach, describe, expect, it, vi } from "vitest";

const withRpcFailoverMock = vi.fn();

vi.mock("@/lib/solana-rpc", () => ({
  withRpcFailover: withRpcFailoverMock,
}));

describe("chain verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_TREASURY_WALLET = "treasury_wallet_1";
  });

  it("passes for valid SOL split-fee transfer", async () => {
    withRpcFailoverMock.mockResolvedValue({
      slot: 123,
      blockTime: Math.floor(new Date("2026-01-01T00:10:00.000Z").getTime() / 1000),
      meta: { err: null },
      transaction: {
        message: {
          accountKeys: [{ pubkey: { toBase58: () => "buyer_wallet_1" } }],
          instructions: [
            {
              program: "system",
              parsed: {
                type: "transfer",
                info: {
                  source: "buyer_wallet_1",
                  destination: "merchant_wallet_1",
                  lamports: 997000000,
                },
              },
            },
            {
              program: "system",
              parsed: {
                type: "transfer",
                info: {
                  source: "buyer_wallet_1",
                  destination: "treasury_wallet_1",
                  lamports: 3000000,
                },
              },
            },
          ],
        },
      },
    });

    const { verifyCheckoutPaymentOnChain } = await import("@/lib/chain-verification");
    const result = await verifyCheckoutPaymentOnChain({
      signature: "sig_1",
      amount: 1,
      currency: "SOL",
      merchantWallet: "merchant_wallet_1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date("2026-01-01T00:30:00.000Z"),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.buyerWallet).toBe("buyer_wallet_1");
      expect(result.verifiedSlot).toBe(123);
    }
  });

  it("rejects on SOL amount mismatch", async () => {
    withRpcFailoverMock.mockResolvedValue({
      slot: 123,
      blockTime: Math.floor(new Date("2026-01-01T00:10:00.000Z").getTime() / 1000),
      meta: { err: null },
      transaction: {
        message: {
          accountKeys: [{ pubkey: { toBase58: () => "buyer_wallet_1" } }],
          instructions: [
            {
              program: "system",
              parsed: {
                type: "transfer",
                info: {
                  source: "buyer_wallet_1",
                  destination: "merchant_wallet_1",
                  lamports: 900000000,
                },
              },
            },
          ],
        },
      },
    });

    const { verifyCheckoutPaymentOnChain } = await import("@/lib/chain-verification");
    const result = await verifyCheckoutPaymentOnChain({
      signature: "sig_1",
      amount: 1,
      currency: "SOL",
      merchantWallet: "merchant_wallet_1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date("2026-01-01T00:30:00.000Z"),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("CHAIN_AMOUNT_MISMATCH");
    }
  });
});
