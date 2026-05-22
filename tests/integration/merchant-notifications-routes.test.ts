import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentMerchantMock = vi.fn();

const prismaMock = {
  merchantNotification: {
    findMany: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
  merchantNotificationPreference: {
    upsert: vi.fn(),
  },
};

vi.mock("@/lib/auth-service", () => ({
  getCurrentMerchant: getCurrentMerchantMock,
}));

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

describe("merchant notifications routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for notifications list when unauthorized", async () => {
    getCurrentMerchantMock.mockResolvedValue(null);
    const { GET } = await import("@/app/api/merchant/notifications/route");

    const res = await GET(new Request("http://localhost/api/merchant/notifications"));
    const json = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("MERCHANT_UNAUTHORIZED");
  });

  it("returns paginated notifications", async () => {
    getCurrentMerchantMock.mockResolvedValue({ id: "m1" });
    prismaMock.merchantNotification.findMany.mockResolvedValue([
      { id: "n3", createdAt: new Date() },
      { id: "n2", createdAt: new Date() },
      { id: "n1", createdAt: new Date() },
    ]);

    const { GET } = await import("@/app/api/merchant/notifications/route");
    const res = await GET(new Request("http://localhost/api/merchant/notifications?limit=2"));
    const json = (await res.json()) as { data: Array<{ id: string }>; pagination: { hasMore: boolean; nextCursor: string | null } };

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.pagination.hasMore).toBe(true);
    expect(json.pagination.nextCursor).toBe("n2");
  });

  it("marks all notifications as read", async () => {
    getCurrentMerchantMock.mockResolvedValue({ id: "m1" });
    prismaMock.merchantNotification.updateMany.mockResolvedValue({ count: 3 });

    const { POST } = await import("@/app/api/merchant/notifications/mark-read/route");
    const res = await POST(
      new Request("http://localhost/api/merchant/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      }),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.merchantNotification.updateMany).toHaveBeenCalled();
  });

  it("returns unread count", async () => {
    getCurrentMerchantMock.mockResolvedValue({ id: "m1" });
    prismaMock.merchantNotification.count.mockResolvedValue(7);

    const { GET } = await import("@/app/api/merchant/notifications/unread-count/route");
    const res = await GET();
    const json = (await res.json()) as { data: { unread: number } };

    expect(res.status).toBe(200);
    expect(json.data.unread).toBe(7);
  });

  it("updates notification preferences", async () => {
    getCurrentMerchantMock.mockResolvedValue({ id: "m1" });
    prismaMock.merchantNotificationPreference.upsert.mockResolvedValue({
      merchantId: "m1",
      paymentSuccess: true,
      paymentFailed: false,
      paymentPendingTooLong: true,
      webhookDeliveryFailed: true,
      webhookRecovered: true,
    });

    const { POST } = await import("@/app/api/merchant/notification-preferences/route");
    const res = await POST(
      new Request("http://localhost/api/merchant/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentFailed: false }),
      }),
    );

    expect(res.status).toBe(200);
    expect(prismaMock.merchantNotificationPreference.upsert).toHaveBeenCalled();
  });
});
