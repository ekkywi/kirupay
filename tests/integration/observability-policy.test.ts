import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("observability policy", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env = { ...envBackup };
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("suppresses info logs in production by default but still updates metrics", async () => {
    process.env.NODE_ENV = "production";
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1012);

    const obs = await import("@/lib/observability");
    obs.resetObservabilityMetricsForTest();
    const ctx = obs.startObservation("req_1", "POST /api/internal/rpc-telemetry");
    obs.recordObservation(ctx, { outcome: "success", status: 200 });

    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    const snapshot = obs.getObservabilityMetricsSnapshot();
    expect(snapshot.byTarget).toEqual([
      expect.objectContaining({ target: "POST /api/internal/rpc-telemetry", requests: 1, errors: 0 }),
    ]);
  });

  it("applies deterministic info sampling when enabled in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.OBS_LOG_LEVEL = "info";
    process.env.OBS_INFO_ENABLED_IN_PROD = "true";
    process.env.OBS_INFO_SAMPLE_RATE = "0.5";

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(Math, "random").mockReturnValue(0.25);
    vi.spyOn(Date, "now").mockReturnValueOnce(2000).mockReturnValueOnce(2010);

    const obs = await import("@/lib/observability");
    obs.resetObservabilityMetricsForTest();
    const ctx = obs.startObservation("req_2", "POST /api/v1/checkout");
    obs.recordObservation(ctx, { outcome: "success", status: 201 });

    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it("always logs errors regardless of info suppression settings", async () => {
    process.env.NODE_ENV = "production";
    process.env.OBS_INFO_ENABLED_IN_PROD = "false";

    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(Date, "now").mockReturnValueOnce(3000).mockReturnValueOnce(3011);

    const obs = await import("@/lib/observability");
    obs.resetObservabilityMetricsForTest();
    const ctx = obs.startObservation("req_3", "POST /api/v1/checkout");
    obs.recordObservation(ctx, { outcome: "error", status: 500, errorCode: "INTERNAL_SERVER_ERROR" });

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it("promotes slow success from info to warn in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.OBS_WARN_LATENCY_MS = "1000";

    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(Date, "now").mockReturnValueOnce(4000).mockReturnValueOnce(5205);

    const obs = await import("@/lib/observability");
    obs.resetObservabilityMetricsForTest();
    const ctx = obs.startObservation("req_4", "POST /api/internal/confirm");
    obs.recordObservation(ctx, { outcome: "success", status: 200 });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const [, payload] = warnSpy.mock.calls[0];
    expect((payload as { severity: string }).severity).toBe("warn");
  });
});
