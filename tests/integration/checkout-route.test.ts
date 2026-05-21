import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  merchant: {
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

describe("POST /api/v1/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "https://trezalink.test";
    maintenanceMock.mockResolvedValue(null);
  });

  it("returns 401 when bearer token is missing", async () => {
    const { POST } = await import("@/app/api/v1/checkout/route");

    const req = new Request("http://localhost/api/v1/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: "INV-1", amount: 1, currency: "SOL" }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string; requestId: string; retryable: boolean; docsUrl: string } };

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("AUTH_MISSING_BEARER_TOKEN");
    expect(json.error.requestId).toMatch(/^req_/);
    expect(json.error.retryable).toBe(false);
    expect(json.error.docsUrl).toContain("error-auth_missing_bearer_token");
  });

  it("returns 400 on validation error with diagnostics contract", async () => {
    prismaMock.merchant.findUnique.mockResolvedValue({
      id: "m1",
      isActive: true,
      walletAddress: "FQfNw1xwV3Qx9ZxZxZxZxZxZxZxZxZxZxZxZxZ",
    });

    const { POST } = await import("@/app/api/v1/checkout/route");

    const req = new Request("http://localhost/api/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid_key",
      },
      body: JSON.stringify({ orderId: "INV-2", amount: -10, currency: "SOL" }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string; details?: Record<string, unknown> } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("CHECKOUT_VALIDATION_FAILED");
    expect(json.error.details).toBeDefined();
  });

  it("returns 400 when metadata exceeds allowed length", async () => {
    prismaMock.merchant.findUnique.mockResolvedValue({
      id: "m1",
      isActive: true,
      walletAddress: "FQfNw1xwV3Qx9ZxZxZxZxZxZxZxZxZxZxZxZxZ",
    });

    const { POST } = await import("@/app/api/v1/checkout/route");

    const req = new Request("http://localhost/api/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid_key",
      },
      body: JSON.stringify({
        orderId: "INV-META-TOO-LONG",
        amount: 10,
        currency: "SOL",
        notes: "x".repeat(301),
      }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string; details?: Record<string, unknown> } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("CHECKOUT_VALIDATION_FAILED");
    expect(json.error.details).toBeDefined();
  });

  it("returns 409 when duplicate order id exists", async () => {
    prismaMock.merchant.findUnique.mockResolvedValue({
      id: "m1",
      isActive: true,
      walletAddress: "FQfNw1xwV3Qx9ZxZxZxZxZxZxZxZxZxZxZxZxZ",
    });
    prismaMock.transaction.findFirst.mockResolvedValue({ id: "txn-existing" });

    const { POST } = await import("@/app/api/v1/checkout/route");

    const req = new Request("http://localhost/api/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid_key",
      },
      body: JSON.stringify({ orderId: "INV-3", amount: 10, currency: "SOL" }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(json.error.code).toBe("CHECKOUT_DUPLICATE_ORDER_ID");
  });

  it("returns 503 + Retry-After when maintenance is active", async () => {
    maintenanceMock.mockResolvedValue({
      status: 503,
      retryAfter: "300",
      payload: {
        error: "System under maintenance",
        message: "Maintenance in progress",
        maintenanceEndsAt: null,
      },
    });

    const { POST } = await import("@/app/api/v1/checkout/route");

    const req = new Request("http://localhost/api/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid_key",
      },
      body: JSON.stringify({ orderId: "INV-4", amount: 10, currency: "SOL" }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("300");
    expect(json.error.code).toBe("MAINTENANCE_MODE_ACTIVE");
  });

  it("returns 201 on success", async () => {
    prismaMock.merchant.findUnique.mockResolvedValue({
      id: "m1",
      isActive: true,
      walletAddress: "FQfNw1xwV3Qx9ZxZxZxZxZxZxZxZxZxZxZxZxZ",
    });
    prismaMock.transaction.findFirst.mockResolvedValue(null);
    prismaMock.transaction.create.mockResolvedValue({ id: "txn_abc" });

    const { POST } = await import("@/app/api/v1/checkout/route");

    const req = new Request("http://localhost/api/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid_key",
      },
      body: JSON.stringify({ orderId: "INV-5", amount: 10, currency: "SOL" }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { transactionId: string; checkoutUrl: string };

    expect(res.status).toBe(201);
    expect(json.transactionId).toBe("txn_abc");
    expect(json.checkoutUrl).toBe("https://trezalink.test/pay/txn_abc");
  });
});
