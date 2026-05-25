import { beforeEach, describe, expect, it, vi } from "vitest";

const requireBusinessMembershipMock = vi.fn();
const requireBusinessMembershipByIdMock = vi.fn();

vi.mock("@/lib/auth-service", () => ({
  requireBusinessMembership: requireBusinessMembershipMock,
  requireBusinessMembershipById: requireBusinessMembershipByIdMock,
  mapMerchantAccessError: (error: Error) =>
    error.message === "Forbidden"
      ? { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." }
      : { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." },
}));

vi.mock("@/lib/neon", () => ({
  default: {},
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
