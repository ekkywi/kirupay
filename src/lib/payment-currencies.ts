export const SUPPORTED_PAYMENT_CURRENCIES = ["SOL", "USDC"] as const;

export type PaymentCurrency = (typeof SUPPORTED_PAYMENT_CURRENCIES)[number];

export const DEFAULT_PAYMENT_CURRENCY: PaymentCurrency = "SOL";

export function isSupportedPaymentCurrency(value: unknown): value is PaymentCurrency {
  return typeof value === "string" && SUPPORTED_PAYMENT_CURRENCIES.includes(value as PaymentCurrency);
}

export function buildPaymentCurrencyOptions(discoveredCurrencies: string[]) {
  const normalized = Array.from(
    new Set(
      discoveredCurrencies
        .map((currency) => currency.trim().toUpperCase())
        .filter((currency) => currency && currency !== "ALL")
    )
  );

  const extras = normalized
    .filter((currency) => !isSupportedPaymentCurrency(currency))
    .sort((a, b) => a.localeCompare(b));

  return [...SUPPORTED_PAYMENT_CURRENCIES, ...extras];
}
