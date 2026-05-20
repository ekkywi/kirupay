import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentMerchantMock = vi.fn();
const confirmTransactionPaymentMock = vi.fn();
const logRpcUsageEventMock = vi.fn();
const prismaMock = {
  merchant: {
    update: vi.fn(),
  },
};

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/auth-service", () => ({
  getCurrentMerchant: getCurrentMerchantMock,
}));

vi.mock("@/lib/payment-recovery", () => ({
  confirmTransactionPayment: confirmTransactionPaymentMock,
}));

vi.mock("@/lib/rpc-traffic", () => ({
  logRpcUsageEvent: logRpcUsageEventMock,
}));

describe("error contract consistency for internal/merchant routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("merchant API key regenerate returns MERCHANT_UNAUTHORIZED", async () => {
    getCurrentMerchantMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/merchant/apikey/regenerate/route");

    const res = await POST();
    const json = (await res.json()) as { error: { code: string; requestId: string; docsUrl: string } };

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("MERCHANT_UNAUTHORIZED");
    expect(json.error.requestId).toMatch(/^req_/);
    expect(json.error.docsUrl).toContain("error-merchant_unauthorized");
  });

  it("internal confirm returns missing-fields diagnostics", async () => {
    const { POST } = await import("@/app/api/internal/confirm/route");

    const req = new Request("http://localhost/api/internal/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("INTERNAL_CONFIRMATION_MISSING_FIELDS");
  });

  it("internal rpc telemetry returns invalid-payload diagnostics", async () => {
    const { POST } = await import("@/app/api/internal/rpc-telemetry/route");

    const req = new Request("http://localhost/api/internal/rpc-telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "wallet.getBalance" }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("INTERNAL_RPC_TELEMETRY_INVALID_PAYLOAD");
    expect(logRpcUsageEventMock).not.toHaveBeenCalled();
  });

  it("internal confirm maps rejection into INTERNAL_CONFIRMATION_REJECTED", async () => {
    confirmTransactionPaymentMock.mockResolvedValue({
      success: false,
      error: "Transaction mismatch",
      statusCode: 409,
    });

    const { POST } = await import("@/app/api/internal/confirm/route");

    const req = new Request("http://localhost/api/internal/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: "txn_1", signature: "sig_1" }),
    });

    const res = await POST(req);
    const json = (await res.json()) as { error: { code: string; message: string } };

    expect(res.status).toBe(409);
    expect(json.error.code).toBe("INTERNAL_CONFIRMATION_REJECTED");
    expect(json.error.message).toContain("Transaction mismatch");
  });
});
