import { beforeEach, describe, expect, it, vi } from "vitest";

const runRpcHealthChecksMock = vi.fn();
const getRpcHealthSummaryMock = vi.fn();

vi.mock("@/lib/rpc-health", () => ({
  runRpcHealthChecks: runRpcHealthChecksMock,
  getRpcHealthSummary: getRpcHealthSummaryMock,
}));

describe("GET /api/internal/rpc-health/cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RPC_HEALTH_CRON_SECRET = "cron_secret_test";
  });

  it("returns structured unauthorized error contract", async () => {
    const { GET } = await import("@/app/api/internal/rpc-health/cron/route");

    const req = new Request("http://localhost/api/internal/rpc-health/cron", {
      method: "GET",
    });

    const res = await GET(req);
    const json = (await res.json()) as {
      error: {
        code: string;
        message: string;
        requestId: string;
        retryable: boolean;
        docsUrl: string;
      };
    };

    expect(res.status).toBe(401);
    expect(json.error.code).toBe("INTERNAL_CRON_UNAUTHORIZED");
    expect(json.error.message).toBe("Unauthorized cron access.");
    expect(json.error.requestId).toMatch(/^req_/);
    expect(json.error.retryable).toBe(false);
    expect(json.error.docsUrl).toContain("error-internal_cron_unauthorized");
  });

  it("returns success payload when authorized", async () => {
    runRpcHealthChecksMock.mockResolvedValue({
      ok: true,
      error: null,
      results: [{ id: "r1" }],
    });
    getRpcHealthSummaryMock.mockResolvedValue({
      rateLimitAlert: false,
      oneHour: {
        totalChecks: 1,
        rateLimitedCount: 0,
        rateLimitedRate: 0,
      },
    });

    const { GET } = await import("@/app/api/internal/rpc-health/cron/route");

    const req = new Request("http://localhost/api/internal/rpc-health/cron", {
      method: "GET",
      headers: {
        "x-cron-secret": "cron_secret_test",
      },
    });

    const res = await GET(req);
    const json = (await res.json()) as {
      ok: boolean;
      checkedEndpoints: number;
      rateLimitAlert: boolean;
      oneHour: { totalChecks: number };
    };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.checkedEndpoints).toBe(1);
    expect(json.rateLimitAlert).toBe(false);
    expect(json.oneHour.totalChecks).toBe(1);
  });
});
