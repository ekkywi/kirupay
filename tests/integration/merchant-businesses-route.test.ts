import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentActorMock = vi.fn();
const prismaMock = {
  businessMembership: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/auth-service", () => ({
  getCurrentActor: getCurrentActorMock,
}));

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

describe("GET /api/merchant/businesses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not leak api key and webhook secret in list response", async () => {
    getCurrentActorMock.mockResolvedValue({
      actorType: "merchant",
      merchant: { id: "m1", activeBusinessId: "biz_1" },
    });

    prismaMock.businessMembership.findMany.mockResolvedValue([
      {
        id: "mem_1",
        role: "OWNER",
        isActive: true,
        businessId: "biz_1",
        business: {
          id: "biz_1",
          name: "Biz One",
          code: "biz-one",
          isActive: true,
          contactEmail: "biz1@test.com",
          settlementWallets: [{ walletAddress: "wallet_1" }],
        },
      },
    ]);

    const { GET } = await import("@/app/api/merchant/businesses/route");
    const res = await GET();
    const json = (await res.json()) as { data: Array<Record<string, unknown>> };

    expect(res.status).toBe(200);
    const businessPayload = json.data[0]?.business ?? {};
    expect(businessPayload).not.toHaveProperty("apiKey");
    expect(businessPayload).not.toHaveProperty("webhookSecret");
  });
});
