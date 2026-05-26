import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  transaction: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    updateManyAndReturn: vi.fn(),
    updateMany: vi.fn(),
  },
  webhookLog: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};

const createMerchantNotificationMock = vi.fn();

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/merchant-notifications", () => ({
  createMerchantNotification: createMerchantNotificationMock,
}));

describe("payment recovery notification integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    prismaMock.transaction.findFirst.mockResolvedValue(null);
  });

  it("creates payment success + webhook failure notification", async () => {
    const now = new Date();
    prismaMock.transaction.findUnique.mockResolvedValue({
      id: "tx1",
      amount: 10,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      currency: "SOL",
      txSignature: null,
      businessId: "b1",
      orderId: "INV-001",
      business: { credentials: { webhookUrl: "https://merchant.test/webhook", webhookSecret: "whsec_abc" } },
    });

    prismaMock.transaction.updateManyAndReturn.mockResolvedValue([{
      id: "tx1",
      amount: 10,
      feeAmount: 0.03,
      netAmount: 9.97,
      currency: "SOL",
      status: "PAID",
      txSignature: "sig_1",
      buyerWallet: null,
      walletProvider: null,
      updatedAt: now,
      businessId: "b1",
      orderId: "INV-001",
      business: { credentials: { webhookUrl: "https://merchant.test/webhook", webhookSecret: "whsec_abc" } },
    }]);

    vi.mocked(fetch).mockResolvedValue(
      new Response("failed", {
        status: 500,
      }),
    );

    prismaMock.webhookLog.create.mockResolvedValue({
      id: "wl_1",
      businessId: "b1",
      event: "payment.success",
      status: 500,
      response: "failed",
    });

    const { confirmTransactionPayment } = await import("@/lib/payment-recovery");
    const result = await confirmTransactionPayment({ transactionId: "tx1", signature: "sig_1" });

    expect(result.success).toBe(true);
    expect(createMerchantNotificationMock).toHaveBeenCalledWith(expect.objectContaining({ type: "PAYMENT_SUCCESS" }));
    expect(createMerchantNotificationMock).toHaveBeenCalledWith(expect.objectContaining({ type: "WEBHOOK_DELIVERY_FAILED" }));
  });

  it("creates webhook recovered notification on successful retry", async () => {
    prismaMock.webhookLog.findUnique.mockResolvedValue({
      id: "wl_old",
      event: "payment.success",
      payload: "{\"event\":\"payment.success\"}",
      businessId: "b1",
      business: {
        name: "Acme",
        credentials: {
          webhookUrl: "https://merchant.test/webhook",
          webhookSecret: "whsec_abc",
        },
      },
    });

    vi.mocked(fetch).mockResolvedValue(new Response("ok", { status: 200 }));
    prismaMock.webhookLog.create.mockResolvedValue({
      id: "wl_retry",
      event: "payment.success.retry",
      businessId: "b1",
      status: 200,
    });

    const { retryWebhookDelivery } = await import("@/lib/payment-recovery");
    const result = await retryWebhookDelivery("wl_old");

    expect(result.success).toBe(true);
    expect(prismaMock.webhookLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          retriedFromLogId: "wl_old",
        }),
      }),
    );
    expect(createMerchantNotificationMock).toHaveBeenCalledWith(expect.objectContaining({ type: "WEBHOOK_RECOVERED" }));
  });
});
