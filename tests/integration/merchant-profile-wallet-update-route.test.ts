import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentMerchantMock = vi.fn();
const prismaMock = {
  merchantPrivateWalletIdentity: {
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/auth-service", () => ({
  getCurrentMerchant: getCurrentMerchantMock,
}));

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

describe("POST /api/merchant/profile/wallet/update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when merchant is not authenticated", async () => {
    getCurrentMerchantMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/merchant/profile/wallet/update/route");

    const res = await POST(
      new Request("http://localhost/api/merchant/profile/wallet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink" }),
      }),
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("MERCHANT_UNAUTHORIZED");
  });

  it("unlinks personal wallet for authenticated merchant", async () => {
    getCurrentMerchantMock.mockResolvedValue({ id: "m1" });
    prismaMock.merchantPrivateWalletIdentity.updateMany.mockResolvedValue({ count: 1 });
    const { POST } = await import("@/app/api/merchant/profile/wallet/update/route");

    const res = await POST(
      new Request("http://localhost/api/merchant/profile/wallet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink" }),
      }),
    );
    const json = (await res.json()) as { walletAddress: string | null };

    expect(res.status).toBe(200);
    expect(json.walletAddress).toBeNull();
    expect(prismaMock.merchantPrivateWalletIdentity.updateMany).toHaveBeenCalledWith({
      where: { merchantId: "m1", isActive: true },
      data: { isActive: false, unlinkedAt: expect.any(Date) },
    });
  });
});
