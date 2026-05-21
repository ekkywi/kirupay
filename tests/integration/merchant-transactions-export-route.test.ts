import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentMerchantMock = vi.fn();
const prismaMock = {
  transaction: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/auth-service", () => ({
  getCurrentMerchant: getCurrentMerchantMock,
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
    getCurrentMerchantMock.mockResolvedValue(null);
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    const res = await GET(new Request("http://localhost/api/merchant/transactions/export"));
    const json = (await res.json()) as { error: { code: string; requestId: string; docsUrl: string } };

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("MERCHANT_UNAUTHORIZED");
    expect(json.error.requestId).toMatch(/^req_/);
    expect(json.error.docsUrl).toContain("error-merchant_unauthorized");
  });

  it("returns 400 for invalid date query", async () => {
    getCurrentMerchantMock.mockResolvedValue({ id: "m_1" });
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    const res = await GET(new Request("http://localhost/api/merchant/transactions/export?from=invalid-date"));
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(json.error.code).toBe("MERCHANT_EXPORT_VALIDATION_FAILED");
  });

  it("uses default filter (PAID + last 30 days) and returns csv response headers", async () => {
    getCurrentMerchantMock.mockResolvedValue({ id: "merchant_123" });
    prismaMock.transaction.findMany.mockResolvedValue([]);
    const { GET } = await import("@/app/api/merchant/transactions/export/route");

    const res = await GET(new Request("http://localhost/api/merchant/transactions/export"));
    const csv = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain(
      'attachment; filename="transactions-reconciliation-20260521.csv"',
    );
    expect(csv.startsWith("transactionId,merchantId,orderId,status,currency,grossAmount,feeAmount,netAmount,txSignature,source,buyerWallet,customerEmail,customerReference,customerName,notes,createdAtUtc,updatedAtUtc")).toBe(true);

    expect(prismaMock.transaction.findMany).toHaveBeenCalledTimes(1);
    const callArg = prismaMock.transaction.findMany.mock.calls[0][0] as {
      where: {
        merchantId: string;
        status: string;
        createdAt: { gte: Date; lte: Date };
      };
    };

    expect(callArg.where.merchantId).toBe("merchant_123");
    expect(callArg.where.status).toBe("PAID");
    expect(callArg.where.createdAt.lte.toISOString()).toBe("2026-05-21T10:00:00.000Z");
    expect(callArg.where.createdAt.gte.toISOString()).toBe("2026-04-21T10:00:00.000Z");
  });

  it("returns csv rows with raw numeric values, UTC timestamps, and empty strings for null fields", async () => {
    getCurrentMerchantMock.mockResolvedValue({ id: "merchant_123" });
    prismaMock.transaction.findMany.mockResolvedValue([
      {
        id: "txn_1",
        merchantId: "merchant_123",
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
});
