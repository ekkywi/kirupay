import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  transaction: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  merchant: {
    count: vi.fn(),
  },
  webhookLog: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

describe("platform operations snapshot webhook recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.transaction.count
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(13);

    prismaMock.merchant.count.mockResolvedValue(6);
    prismaMock.webhookLog.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(2);
    prismaMock.webhookLog.findMany.mockResolvedValue([]);
    prismaMock.transaction.findMany.mockResolvedValue([]);
  });

  it("counts and lists only unresolved failed root webhook logs", async () => {
    const { getPlatformOperationsSnapshot } = await import("@/lib/platform-maintenance");

    const snapshot = await getPlatformOperationsSnapshot();

    const unresolvedFailedWhere = {
      retriedFromLogId: null,
      OR: [{ status: null }, { status: { lt: 200 } }, { status: { gte: 300 } }],
      retryChildren: {
        none: {
          status: {
            gte: 200,
            lt: 300,
          },
        },
      },
    };

    expect(prismaMock.webhookLog.count).toHaveBeenNthCalledWith(2, {
      where: unresolvedFailedWhere,
    });

    expect(prismaMock.webhookLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: unresolvedFailedWhere,
      }),
    );

    expect(snapshot.failedWebhookLogs).toBe(2);
    expect(snapshot.recentFailedWebhookLogs).toEqual([]);
  });
});
