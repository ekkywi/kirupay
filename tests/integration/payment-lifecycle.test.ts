import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  transaction: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
};

const createMerchantNotificationMock = vi.fn();

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/merchant-notifications", () => ({
  createMerchantNotification: createMerchantNotificationMock,
}));

describe("payment lifecycle evaluator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMerchantNotificationMock.mockResolvedValue({ created: true });
  });

  it("emits pending warning at 20m and fails at 30m", async () => {
    prismaMock.transaction.findMany
      .mockResolvedValueOnce([
        {
          id: "tx_warn",
          merchantId: "m1",
          orderId: "INV-WARN",
          amount: 1,
          currency: "SOL",
          expiresAt: new Date("2026-05-22T10:30:00.000Z"),
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "tx_fail",
          merchantId: "m1",
          orderId: "INV-FAIL",
          amount: 2,
          currency: "SOL",
          expiresAt: new Date("2026-05-22T10:00:00.000Z"),
        },
      ]);

    prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });

    const { evaluatePaymentLifecycle } = await import("@/lib/payment-lifecycle");
    const result = await evaluatePaymentLifecycle(new Date("2026-05-22T10:31:00.000Z"));

    expect(result.warned).toBe(1);
    expect(result.failed).toBe(1);
    expect(createMerchantNotificationMock).toHaveBeenCalledWith(expect.objectContaining({
      type: "PAYMENT_PENDING_TOO_LONG",
      dedupMode: "once",
    }));
    expect(createMerchantNotificationMock).toHaveBeenCalledWith(expect.objectContaining({
      type: "PAYMENT_FAILED",
      dedupMode: "once",
    }));
  });

  it("does not emit failed notification when status update is not applied", async () => {
    prismaMock.transaction.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: "tx_fail",
          merchantId: "m1",
          orderId: "INV-FAIL",
          amount: 2,
          currency: "SOL",
          expiresAt: new Date("2026-05-22T10:00:00.000Z"),
        },
      ]);

    prismaMock.transaction.updateMany.mockResolvedValue({ count: 0 });

    const { evaluatePaymentLifecycle } = await import("@/lib/payment-lifecycle");
    const result = await evaluatePaymentLifecycle(new Date("2026-05-22T10:31:00.000Z"));

    expect(result.failed).toBe(0);
    expect(createMerchantNotificationMock).not.toHaveBeenCalledWith(expect.objectContaining({
      type: "PAYMENT_FAILED",
    }));
  });
});
