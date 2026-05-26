import { beforeEach, describe, expect, it, vi } from "vitest";

const requireBusinessMembershipByIdMock = vi.fn();

vi.mock("@/lib/auth-service", () => ({
  requireBusinessMembershipById: requireBusinessMembershipByIdMock,
  mapMerchantAccessError: (error: Error) =>
    error.message === "Forbidden"
      ? { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." }
      : { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." },
}));

describe("GET /api/merchant/businesses/[id]/manage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns api key and webhook secret for OWNER", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({
      membership: { id: "mem_1", role: "OWNER", isActive: true },
      business: {
        id: "biz_1",
        name: "Biz One",
        code: "biz-one",
        isActive: true,
        settlementWallet: { walletAddress: "wallet_1" },
        credentials: { apiKey: "key_live_123", webhookUrl: "https://example.com/hook", webhookSecret: "whsec_123" },
      },
    });

    const { GET } = await import("@/app/api/merchant/businesses/[id]/manage/route");
    const res = await GET(new Request("http://localhost/api/merchant/businesses/biz_1/manage"), {
      params: Promise.resolve({ id: "biz_1" }),
    });
    const json = (await res.json()) as { data: { business: { apiKey: string | null; webhookSecret: string | null } } };

    expect(res.status).toBe(200);
    expect(json.data.business.apiKey).toBe("key_live_123");
    expect(json.data.business.webhookSecret).toBe("whsec_123");
  });

  it("hides api key and webhook secret for non-OWNER roles", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({
      membership: { id: "mem_2", role: "ADMIN", isActive: true },
      business: {
        id: "biz_1",
        name: "Biz One",
        code: "biz-one",
        isActive: true,
        settlementWallet: { walletAddress: "wallet_1" },
        credentials: { apiKey: "key_live_123", webhookUrl: "https://example.com/hook", webhookSecret: "whsec_123" },
      },
    });

    const { GET } = await import("@/app/api/merchant/businesses/[id]/manage/route");
    const res = await GET(new Request("http://localhost/api/merchant/businesses/biz_1/manage"), {
      params: Promise.resolve({ id: "biz_1" }),
    });
    const json = (await res.json()) as { data: { business: { apiKey: string | null; webhookSecret: string | null } } };

    expect(res.status).toBe(200);
    expect(json.data.business.apiKey).toBeNull();
    expect(json.data.business.webhookSecret).toBeNull();
  });

  it("maps unauthorized access error", async () => {
    requireBusinessMembershipByIdMock.mockRejectedValue(new Error("Unauthorized"));

    const { GET } = await import("@/app/api/merchant/businesses/[id]/manage/route");
    const res = await GET(new Request("http://localhost/api/merchant/businesses/biz_1/manage"), {
      params: Promise.resolve({ id: "biz_1" }),
    });
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("MERCHANT_UNAUTHORIZED");
  });
});
