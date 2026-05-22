import { describe, expect, it } from "vitest";
import { evaluateCheckoutSessionState } from "@/lib/checkout-session";

describe("checkout session state evaluator", () => {
  it("marks FAILED session as inactive with failed reason", () => {
    const state = evaluateCheckoutSessionState({
      status: "FAILED",
      expiresAt: "2026-05-22T10:00:00.000Z",
      nowMs: Date.parse("2026-05-22T09:00:00.000Z"),
    });

    expect(state.isInactive).toBe(true);
    expect(state.inactiveReason).toBe("FAILED");
  });

  it("handles invalid expiresAt safely without throwing", () => {
    const state = evaluateCheckoutSessionState({
      status: "FAILED",
      expiresAt: "not-a-date",
      nowMs: Date.parse("2026-05-22T10:00:00.000Z"),
    });

    expect(state.isInactive).toBe(true);
    expect(state.inactiveReason).toBe("FAILED");
    expect(state.expiresAtDate).toBeNull();
    expect(state.isExpired).toBe(false);
  });

  it("marks pending expired session as inactive with expired reason", () => {
    const state = evaluateCheckoutSessionState({
      status: "PENDING",
      expiresAt: "2026-05-22T09:00:00.000Z",
      nowMs: Date.parse("2026-05-22T10:00:00.000Z"),
    });

    expect(state.isInactive).toBe(true);
    expect(state.inactiveReason).toBe("EXPIRED");
    expect(state.isExpired).toBe(true);
  });

  it("keeps pending non-expired session active", () => {
    const state = evaluateCheckoutSessionState({
      status: "PENDING",
      expiresAt: "2026-05-22T11:00:00.000Z",
      nowMs: Date.parse("2026-05-22T10:00:00.000Z"),
    });

    expect(state.isInactive).toBe(false);
    expect(state.inactiveReason).toBeNull();
    expect(state.isExpired).toBe(false);
  });

  it("keeps paid session active", () => {
    const state = evaluateCheckoutSessionState({
      status: "PAID",
      expiresAt: "2026-05-22T09:00:00.000Z",
      nowMs: Date.parse("2026-05-22T10:00:00.000Z"),
    });

    expect(state.isInactive).toBe(false);
    expect(state.isExpired).toBe(false);
    expect(state.inactiveReason).toBeNull();
  });
});
