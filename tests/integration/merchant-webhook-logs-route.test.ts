import { beforeEach, describe, expect, it, vi } from "vitest";

const requireBusinessMembershipMock = vi.fn();
const requireBusinessMembershipByIdMock = vi.fn();

const prismaMock = {
  webhookLog: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/auth-service", () => ({
  requireBusinessMembership: requireBusinessMembershipMock,
  requireBusinessMembershipById: requireBusinessMembershipByIdMock,
  mapMerchantAccessError: (error: Error) =>
    error.message === "Forbidden"
      ? { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." }
      : { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." },
}));

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

describe("GET /api/merchant/webhook/logs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses explicit businessId query and isolates logs", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({ business: { id: "biz_2" } });
    prismaMock.webhookLog.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/merchant/webhook/logs/route");
    const res = await GET(new Request("http://localhost/api/merchant/webhook/logs?businessId=biz_2"));

    expect(res.status).toBe(200);
    expect(requireBusinessMembershipByIdMock).toHaveBeenCalledWith("biz_2");
    expect(prismaMock.webhookLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { businessId: "biz_2" } }),
    );
  });
});
