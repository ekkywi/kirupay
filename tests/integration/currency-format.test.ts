import { describe, expect, it } from "vitest";
import { formatCurrencyDisplay, formatCurrencyNumber } from "@/lib/currency-format";

describe("currency format", () => {
  it("formats USDC adaptively between 2 and 6 decimals", () => {
    expect(formatCurrencyNumber("USDC", 1)).toBe("1.00");
    expect(formatCurrencyNumber("USDC", 0.03)).toBe("0.03");
    expect(formatCurrencyNumber("USDC", 0.003)).toBe("0.003");
    expect(formatCurrencyNumber("USDC", 0.000001)).toBe("0.000001");
    expect(formatCurrencyNumber("USDC", 0.0000004)).toBe("0.00");
  });

  it("formats SOL with fixed 4 decimals", () => {
    expect(formatCurrencyNumber("SOL", 1)).toBe("1.0000");
    expect(formatCurrencyNumber("SOL", 0.123456)).toBe("0.1235");
  });

  it("formats display with symbol", () => {
    expect(formatCurrencyDisplay("USDC", 0.003)).toBe("0.003 USDC");
    expect(formatCurrencyDisplay("SOL", 2)).toBe("2.0000 SOL");
    expect(formatCurrencyDisplay("USDC", null)).toBe("-");
  });
});
