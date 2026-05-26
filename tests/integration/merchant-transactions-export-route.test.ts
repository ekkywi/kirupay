import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requireBusinessMembershipMock = vi.fn();
const prismaMock = {
  transaction: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/auth-service", () => ({
  requireBusinessMembership: requireBusinessMembershipMock,
  mapMerchantAccessError: (error: Error) =>
    error.message === "Forbidden"
      ? { status: 403, code: "MERCHANT_FORBIDDEN", message: "Forbidden." }
      : { status: 401, code: "MERCHANT_UNAUTHORIZED", message: "Unauthorized." },
}));

describe("GET /api/merchant/transactions/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-21T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 401 when merchant is not authenticated", async () => {
    requireBusinessMembershipMock.mockRejectedValue(new Error("Unauthorized"));
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    const res = await GET(new Request("http://localhost/api/merchant/transactions/export"));
    const json = (await res.json()) as { error: { code: string; requestId: string; docsUrl: string } };

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("MERCHANT_UNAUTHORIZED");
    expect(json.error.requestId).toMatch(/^req_/);
    expect(json.error.docsUrl).toContain("error-merchant_unauthorized");
  });

  it("returns 400 for invalid date query", async () => {
    requireBusinessMembershipMock.mockResolvedValue({ business: { id: "biz_1" } });
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    const res = await GET(new Request("http://localhost/api/merchant/transactions/export?from=invalid-date"));
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("MERCHANT_EXPORT_VALIDATION_FAILED");
  });

  it("uses default filter (PAID + last 30 days) and returns csv response headers", async () => {
    requireBusinessMembershipMock.mockResolvedValue({ business: { id: "business_123" } });
    prismaMock.transaction.findMany.mockResolvedValue([]);
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    const res = await GET(new Request("http://localhost/api/merchant/transactions/export"));
    const csv = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain(
      'attachment; filename="transactions-reconciliation-20260521.csv"',
    );
    expect(csv.startsWith("transactionId,businessId,orderId,status,currency,grossAmount,feeAmount,netAmount,txSignature,source,buyerWallet,customerEmail,customerReference,customerName,notes,createdAtUtc,updatedAtUtc")).toBe(true);

    expect(prismaMock.transaction.findMany).toHaveBeenCalledTimes(1);
    const callArg = prismaMock.transaction.findMany.mock.calls[0][0] as {
      where: {
        businessId: string;
        status: string;
        createdAt: { gte: Date; lte: Date };
      };
    };

    expect(callArg.where.businessId).toBe("business_123");
    expect(callArg.where.status).toBe("PAID");
    expect(callArg.where.createdAt.lte.toISOString()).toBe("2026-05-21T10:00:00.000Z");
    expect(callArg.where.createdAt.gte.toISOString()).toBe("2026-04-21T10:00:00.000Z");
  });

  it("returns csv rows with raw numeric values, UTC timestamps, and empty strings for null fields", async () => {
    requireBusinessMembershipMock.mockResolvedValue({ business: { id: "business_123" } });
    prismaMock.transaction.findMany.mockResolvedValue([
      {
        id: "txn_1",
        businessId: "business_123",
        orderId: "ORD-1",
        status: "PAID",
        currency: "SOL",
        amount: 1.25,
        feeAmount: 0.00375,
        netAmount: 1.24625,
        txSignature: null,
        source: "API",
        buyerWallet: null,
        customerEmail: "buyer@example.com",
        customerReference: "CUST-REF-001",
        customerName: "Avery Stone",
        notes: "Priority support customer",
        createdAt: new Date("2026-05-20T01:02:03.000Z"),
        updatedAt: new Date("2026-05-20T04:05:06.000Z"),
      },
    ]);
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    const res = await GET(
      new Request("http://localhost/api/merchant/transactions/export?status=PAID&from=2026-05-01T00:00:00.000Z&to=2026-05-21T10:00:00.000Z"),
    );
    const csv = await res.text();
    const lines = csv.trimEnd().split("\n");
    const row = lines[1].split(",");

    expect(res.status).toBe(200);
    expect(lines).toHaveLength(2);
    expect(row[0]).toBe("txn_1");
    expect(row[5]).toBe("1.25");
    expect(row[6]).toBe("0.00375");
    expect(row[7]).toBe("1.24625");
    expect(row[8]).toBe("");
    expect(row[10]).toBe("");
    expect(row[12]).toBe("CUST-REF-001");
    expect(row[13]).toBe("Avery Stone");
    expect(row[14]).toBe("Priority support customer");
    expect(row[15]).toBe("2026-05-20T01:02:03.000Z");
    expect(row[16]).toBe("2026-05-20T04:05:06.000Z");
  });

  it("supports status filters ALL, PENDING, and FAILED", async () => {
    requireBusinessMembershipMock.mockResolvedValue({ business: { id: "business_123" } });
    prismaMock.transaction.findMany.mockResolvedValue([]);
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    await GET(new Request("http://localhost/api/merchant/transactions/export?status=ALL"));
    await GET(new Request("http://localhost/api/merchant/transactions/export?status=PENDING"));
    await GET(new Request("http://localhost/api/merchant/transactions/export?status=FAILED"));

    expect(prismaMock.transaction.findMany).toHaveBeenCalledTimes(3);

    const allCall = prismaMock.transaction.findMany.mock.calls[0][0] as {
      where: { status?: string };
    };
    const pendingCall = prismaMock.transaction.findMany.mock.calls[1][0] as {
      where: { status?: string };
    };
    const failedCall = prismaMock.transaction.findMany.mock.calls[2][0] as {
      where: { status?: string };
    };

    expect(allCall.where.status).toBeUndefined();
    expect(pendingCall.where.status).toBe("PENDING");
    expect(failedCall.where.status).toBe("FAILED");
  });

  it("supports source and currency filters", async () => {
    requireBusinessMembershipMock.mockResolvedValue({ business: { id: "business_123" } });
    prismaMock.transaction.findMany.mockResolvedValue([]);
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    await GET(new Request("http://localhost/api/merchant/transactions/export?source=API&currency=SOL"));
    await GET(new Request("http://localhost/api/merchant/transactions/export?source=ALL&currency=ALL"));

    expect(prismaMock.transaction.findMany).toHaveBeenCalledTimes(2);

    const filteredCall = prismaMock.transaction.findMany.mock.calls[0][0] as {
      where: { source?: string; currency?: string };
    };
    const allCall = prismaMock.transaction.findMany.mock.calls[1][0] as {
      where: { source?: string; currency?: string };
    };

    expect(filteredCall.where.source).toBe("API");
    expect(filteredCall.where.currency).toBe("SOL");
    expect(allCall.where.source).toBeUndefined();
    expect(allCall.where.currency).toBeUndefined();
  });

  it("returns 400 when date range exceeds 1 year", async () => {
    requireBusinessMembershipMock.mockResolvedValue({ business: { id: "business_123" } });
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    const res = await GET(
      new Request("http://localhost/api/merchant/transactions/export?from=2025-01-01T00:00:00.000Z&to=2026-01-02T00:00:00.000Z"),
    );
    const json = (await res.json()) as { error: { code: string; message: string } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("MERCHANT_EXPORT_VALIDATION_FAILED");
    expect(json.error.message).toContain("1 year");
  });
});
