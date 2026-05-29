import { beforeEach, describe, expect, it, vi } from "vitest";

const requireBusinessMembershipByIdMock = vi.fn();
const setMerchantSessionTokenMock = vi.fn();

const prismaMock = {
  businessMembership: {
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
  merchant: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/auth-service", () => ({
  requireBusinessMembershipById: requireBusinessMembershipByIdMock,
  mapMerchantAccessError: (error: Error) =>
    error.message === "Forbidden"
      ? { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." }
      : { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." },
}));

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/merchant-session", () => ({
  setMerchantSessionToken: setMerchantSessionTokenMock,
}));

describe("PATCH /api/merchant/businesses/[id]/members/[memberId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<void>) => callback(prismaMock));
  });

  it("rejects role OWNER in payload", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({
      merchant: { id: "m_owner" },
      membership: { role: "OWNER" },
    });

    const { PATCH } = await import("@/app/api/merchant/businesses/[id]/members/[memberId]/route");
    const res = await PATCH(
      new Request("http://localhost/api/merchant/businesses/biz_1/members/mem_1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "OWNER" }),
      }),
      { params: Promise.resolve({ id: "biz_1", memberId: "mem_1" }) },
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("MERCHANT_INVALID_ACTION");
    expect(prismaMock.businessMembership.update).not.toHaveBeenCalled();
  });

  it("updates member role to ADMIN for OWNER requester", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({
      merchant: { id: "m_owner" },
      membership: { role: "OWNER" },
    });
    prismaMock.businessMembership.findFirst.mockResolvedValue({
      id: "mem_2",
      businessId: "biz_1",
      merchantId: "m_member",
    });
    prismaMock.businessMembership.update.mockResolvedValue({ id: "mem_2", role: "ADMIN" });

    const { PATCH } = await import("@/app/api/merchant/businesses/[id]/members/[memberId]/route");
    const res = await PATCH(
      new Request("http://localhost/api/merchant/businesses/biz_1/members/mem_2", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      }),
      { params: Promise.resolve({ id: "biz_1", memberId: "mem_2" }) },
    );

    expect(res.status).toBe(200);
    expect(prismaMock.businessMembership.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "mem_2" },
        data: expect.objectContaining({ role: "ADMIN" }),
      }),
    );
  });

  it("rejects self deactivate for owner", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({
      merchant: { id: "m_owner" },
      membership: { role: "OWNER" },
    });
    prismaMock.businessMembership.findFirst.mockResolvedValue({
      id: "mem_owner",
      businessId: "biz_1",
      merchantId: "m_owner",
    });

    const { PATCH } = await import("@/app/api/merchant/businesses/[id]/members/[memberId]/route");
    const res = await PATCH(
      new Request("http://localhost/api/merchant/businesses/biz_1/members/mem_owner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      }),
      { params: Promise.resolve({ id: "biz_1", memberId: "mem_owner" }) },
    );

    expect(res.status).toBe(400);
    expect(prismaMock.businessMembership.update).not.toHaveBeenCalled();
  });

  it("maps forbidden when requester is non-owner", async () => {
    requireBusinessMembershipByIdMock.mockRejectedValue(new Error("Forbidden"));

    const { PATCH } = await import("@/app/api/merchant/businesses/[id]/members/[memberId]/route");
    const res = await PATCH(
      new Request("http://localhost/api/merchant/businesses/biz_1/members/mem_2", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      }),
      { params: Promise.resolve({ id: "biz_1", memberId: "mem_2" }) },
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(json.error.code).toBe("MERCHANT_FORBIDDEN");
  });
});

describe("DELETE /api/merchant/businesses/[id]/members/[memberId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<void>) => callback(prismaMock));
  });

  it("maps forbidden when requester is non-owner", async () => {
    requireBusinessMembershipByIdMock.mockRejectedValue(new Error("Forbidden"));

    const { DELETE } = await import("@/app/api/merchant/businesses/[id]/members/[memberId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/merchant/businesses/biz_1/members/mem_2", { method: "DELETE" }),
      { params: Promise.resolve({ id: "biz_1", memberId: "mem_2" }) },
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(json.error.code).toBe("MERCHANT_FORBIDDEN");
  });

  it("returns 404 when membership is not found", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({
      merchant: { id: "m_owner", email: "owner@test.com" },
      membership: { role: "OWNER" },
    });
    prismaMock.businessMembership.findFirst.mockResolvedValue(null);

    const { DELETE } = await import("@/app/api/merchant/businesses/[id]/members/[memberId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/merchant/businesses/biz_1/members/missing", { method: "DELETE" }),
      { params: Promise.resolve({ id: "biz_1", memberId: "missing" }) },
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(json.error.code).toBe("AUTH_MERCHANT_NOT_FOUND");
    expect(prismaMock.businessMembership.delete).not.toHaveBeenCalled();
  });

  it("returns 400 when target membership role is OWNER", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({
      merchant: { id: "m_owner", email: "owner@test.com" },
      membership: { role: "OWNER" },
    });
    prismaMock.businessMembership.findFirst.mockResolvedValue({
      id: "mem_owner2",
      businessId: "biz_1",
      merchantId: "m_other_owner",
      role: "OWNER",
    });

    const { DELETE } = await import("@/app/api/merchant/businesses/[id]/members/[memberId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/merchant/businesses/biz_1/members/mem_owner2", { method: "DELETE" }),
      { params: Promise.resolve({ id: "biz_1", memberId: "mem_owner2" }) },
    );
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("MERCHANT_INVALID_ACTION");
    expect(prismaMock.businessMembership.delete).not.toHaveBeenCalled();
  });

  it("deletes non-owner membership successfully", async () => {
    requireBusinessMembershipByIdMock.mockResolvedValue({
      merchant: { id: "m_owner", email: "owner@test.com" },
      membership: { role: "OWNER" },
    });
    prismaMock.businessMembership.findFirst.mockResolvedValue({
      id: "mem_member",
      businessId: "biz_1",
      merchantId: "m_member",
      role: "MEMBER",
    });

    const { DELETE } = await import("@/app/api/merchant/businesses/[id]/members/[memberId]/route");
    const res = await DELETE(
      new Request("http://localhost/api/merchant/businesses/biz_1/members/mem_member", { method: "DELETE" }),
      { params: Promise.resolve({ id: "biz_1", memberId: "mem_member" }) },
    );

    expect(res.status).toBe(200);
    expect(prismaMock.businessMembership.delete).toHaveBeenCalledWith({ where: { id: "mem_member" } });
    expect(setMerchantSessionTokenMock).not.toHaveBeenCalled();
  });
});
