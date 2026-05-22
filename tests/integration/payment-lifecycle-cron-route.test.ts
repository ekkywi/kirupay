import { beforeEach, describe, expect, it, vi } from "vitest";

const evaluatePaymentLifecycleMock = vi.fn();

vi.mock("@/lib/payment-lifecycle", () => ({
  evaluatePaymentLifecycle: evaluatePaymentLifecycleMock,
}));

describe("GET /api/internal/payment-lifecycle/cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYMENT_LIFECYCLE_CRON_SECRET = "cron_secret_test";
  });

  it("returns 401 when secret is invalid", async () => {
    const { GET } = await import("@/app/api/internal/payment-lifecycle/cron/route");
    const res = await GET(new Request("http://localhost/api/internal/payment-lifecycle/cron"));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("INTERNAL_CRON_UNAUTHORIZED");
  });

  it("runs evaluator when authorized", async () => {
    evaluatePaymentLifecycleMock.mockResolvedValue({
      checkedAt: new Date().toISOString(),
      warningCandidates: 1,
      warned: 1,
      expiredCandidates: 1,
      failed: 1,
      failureNotifications: 1,
    });

    const { GET } = await import("@/app/api/internal/payment-lifecycle/cron/route");
    const res = await GET(new Request("http://localhost/api/internal/payment-lifecycle/cron", {
      headers: { "x-cron-secret": "cron_secret_test" },
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.warned).toBe(1);
    expect(evaluatePaymentLifecycleMock).toHaveBeenCalledTimes(1);
  });
});
