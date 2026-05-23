import { describe, expect, it, vi } from "vitest";

const prismaMock = {
  businessCredential: {
    findUnique: vi.fn(),
  },
  transaction: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

const maintenanceMock = vi.fn();

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/maintenance-policy", () => ({
  getPaymentMaintenanceBlock: maintenanceMock,
}));

describe("smoke: checkout create flow", () => {
  it("creates checkout URL for downstream /pay render flow", async () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://trezalink.test";
    maintenanceMock.mockResolvedValue(null);
    prismaMock.businessCredential.findUnique.mockResolvedValue({
      businessId: "biz_smoke",
      business: {
        isActive: true,
        settlementWallets: [{ walletAddress: "FQfNw1xwV3Qx9ZxZxZxZxZxZxZxZxZxZxZxZxZ" }],
      },
    });
    prismaMock.transaction.findFirst.mockResolvedValue(null);
    prismaMock.transaction.create.mockResolvedValue({
      id: "txn_smoke_1",
      expiresAt: new Date("2026-05-22T01:30:00.000Z"),
    });

    const { POST } = await import("@/app/api/v1/checkout/route");

    const req = new Request("http://localhost/api/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer smoke_key",
      },
      body: JSON.stringify({
        orderId: "SMOKE-1",
        amount: 12,
        currency: "SOL",
      }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { transactionId: string; checkoutUrl: string };

    expect(res.status).toBe(201);
    expect(json.transactionId).toBe("txn_smoke_1");
    expect(json.checkoutUrl).toBe("https://trezalink.test/pay/txn_smoke_1");
  });

  it("returns maintenance block for same flow when maintenance is enabled", async () => {
    maintenanceMock.mockResolvedValue({
      status: 503,
      retryAfter: "300",
      payload: {
        error: "System under maintenance",
        message: "Scheduled maintenance in progress",
        maintenanceEndsAt: null,
      },
    });

    const { POST } = await import("@/app/api/v1/checkout/route");

    const req = new Request("http://localhost/api/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer smoke_key",
      },
      body: JSON.stringify({
        orderId: "SMOKE-2",
        amount: 12,
        currency: "SOL",
      }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string; message: string } };

    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("300");
    expect(json.error.code).toBe("MAINTENANCE_MODE_ACTIVE");
    expect(json.error.message).toContain("maintenance");
  });
});
