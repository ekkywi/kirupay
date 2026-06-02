import { describe, expect, it } from "vitest";
import { buildPaymentCurrencyOptions, DEFAULT_PAYMENT_CURRENCY, SUPPORTED_PAYMENT_CURRENCIES } from "@/lib/payment-currencies";

describe("payment currencies", () => {
  it("keeps supported currencies available and appends discovered extras in sorted order", () => {
    expect(DEFAULT_PAYMENT_CURRENCY).toBe("SOL");
    expect(SUPPORTED_PAYMENT_CURRENCIES).toEqual(["SOL", "USDC"]);
    expect(buildPaymentCurrencyOptions(["usdc", "SOL", "eur", "USDC", "btc", "all"])).toEqual(["SOL", "USDC", "BTC", "EUR"]);
  });

  it("still returns supported currencies when no discovered currencies exist", () => {
    expect(buildPaymentCurrencyOptions([])).toEqual(["SOL", "USDC"]);
  });
});
