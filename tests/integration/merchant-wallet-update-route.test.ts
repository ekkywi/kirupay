import { beforeEach, describe, expect, it, vi } from "vitest";

const requireBusinessMembershipMock = vi.fn();
const prismaMock = {
  businessWalletIdentity: {
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/auth-service", () => ({
  requireBusinessMembership: requireBusinessMembershipMock,
}));

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

describe("POST /api/merchant/wallet/update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when member tries to mutate settlement wallet", async () => {
    requireBusinessMembershipMock.mockRejectedValue(new Error("Forbidden"));
    const { POST } = await import("@/app/api/merchant/wallet/update/route");

    const res = await POST(
      new Request("http://localhost/api/merchant/wallet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink" }),
      }),
    );

    const json = (await res.json()) as { error: { code: string } };
    expect(res.status).toBe(403);
    expect(json.error.code).toBe("MERCHANT_FORBIDDEN");
    expect(prismaMock.businessWalletIdentity.updateMany).not.toHaveBeenCalled();
  });
});
