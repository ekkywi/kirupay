import { beforeEach, describe, expect, it, vi } from "vitest";

const requireBusinessMembershipMock = vi.fn();
const requireBusinessMembershipByIdMock = vi.fn();

const prismaMock = {
  businessInvite: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
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

describe("POST /api/merchant/businesses/invites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when MEMBER tries to create invite", async () => {
    requireBusinessMembershipMock.mockRejectedValue(new Error("Forbidden"));

    const { POST } = await import("@/app/api/merchant/businesses/invites/route");
    const res = await POST(
      new Request("http://localhost/api/merchant/businesses/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "MEMBER", expiresInHours: 72 }),
      }),
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(json.error.code).toBe("MERCHANT_FORBIDDEN");
  });
});

describe("DELETE /api/merchant/businesses/invites/[inviteId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when role is not OWNER/ADMIN", async () => {
    requireBusinessMembershipByIdMock.mockRejectedValue(new Error("Forbidden"));

    const { DELETE } = await import("@/app/api/merchant/businesses/invites/[inviteId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/merchant/businesses/invites/inv_1?businessId=biz_1", { method: "DELETE" }),
      { params: Promise.resolve({ inviteId: "inv_1" }) },
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(json.error.code).toBe("MERCHANT_FORBIDDEN");
  });

  it("returns 404 when invite is not found", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({ business: { id: "biz_1" } });
    prismaMock.businessInvite.findFirst.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/merchant/businesses/invites/[inviteId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/merchant/businesses/invites/inv_missing?businessId=biz_1", { method: "DELETE" }),
      { params: Promise.resolve({ inviteId: "inv_missing" }) },
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(json.error.code).toBe("AUTH_MERCHANT_NOT_FOUND");
    expect(prismaMock.businessInvite.delete).not.toHaveBeenCalled();
  });

  it("returns 400 when invite has been used", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({ business: { id: "biz_1" } });
    prismaMock.businessInvite.findFirst.mockResolvedValue({
      id: "inv_used",
      businessId: "biz_1",
      usedAt: new Date(),
    });

    const { DELETE } = await import("@/app/api/merchant/businesses/invites/[inviteId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/merchant/businesses/invites/inv_used?businessId=biz_1", { method: "DELETE" }),
      { params: Promise.resolve({ inviteId: "inv_used" }) },
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("MERCHANT_INVALID_ACTION");
    expect(prismaMock.businessInvite.delete).not.toHaveBeenCalled();
  });

  it("deletes pending invite", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({ business: { id: "biz_1" } });
    prismaMock.businessInvite.findFirst.mockResolvedValue({
      id: "inv_pending",
      businessId: "biz_1",
      usedAt: null,
    });
    prismaMock.businessInvite.delete.mockResolvedValue({
      id: "inv_pending",
      businessId: "biz_1",
      usedAt: null,
    });

    const { DELETE } = await import("@/app/api/merchant/businesses/invites/[inviteId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/merchant/businesses/invites/inv_pending?businessId=biz_1", { method: "DELETE" }),
      { params: Promise.resolve({ inviteId: "inv_pending" }) },
    );

    expect(res.status).toBe(200);
    expect(prismaMock.businessInvite.delete).toHaveBeenCalledWith({ where: { id: "inv_pending" } });
  });
});
