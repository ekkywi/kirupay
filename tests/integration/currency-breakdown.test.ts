import { describe, expect, it } from "vitest";
import { buildCurrencyBreakdown, formatCurrencyAverageBreakdown, formatCurrencyBreakdown } from "@/lib/currency-breakdown";

describe("currency breakdown", () => {
  it("orders supported currencies first and formats each currency separately", () => {
    const rows = [
      { currency: "USDC", _sum: { amount: 2.5, feeAmount: 0.0075, netAmount: 2.4925 } },
      { currency: "SOL", _sum: { amount: 1.2345, feeAmount: 0.0037, netAmount: 1.2308 } },
      { currency: "EUR", _sum: { amount: 9.1, feeAmount: 0.1, netAmount: 9 } },
    ];

    expect(buildCurrencyBreakdown(rows, "amount")).toEqual([
      { currency: "SOL", value: 1.2345 },
      { currency: "USDC", value: 2.5 },
      { currency: "EUR", value: 9.1 },
    ]);

    expect(formatCurrencyBreakdown(rows, "amount")).toBe("1.2345 SOL • 2.50 USDC • 9.1000 EUR");
  });

  it("drops empty currencies and falls back to a dash", () => {
    expect(formatCurrencyBreakdown([], "feeAmount")).toBe("-");
    expect(buildCurrencyBreakdown([{ currency: "SOL", _sum: { amount: 0, feeAmount: 0, netAmount: 0 } }], "amount")).toEqual([]);
  });

  it("formats average values per currency when counts are available", () => {
    const rows = [
      { currency: "SOL", _sum: { amount: 0, feeAmount: 0.006, netAmount: 0 }, _count: { id: 2 } },
      { currency: "USDC", _sum: { amount: 0, feeAmount: 0.01, netAmount: 0 }, _count: { id: 1 } },
    ];

    expect(formatCurrencyAverageBreakdown(rows, "feeAmount")).toBe("0.0030 SOL • 0.01 USDC");
  });
});
