export const SUPPORTED_PAYMENT_CURRENCIES = ["SOL", "USDC"] as const;

export type PaymentCurrency = (typeof SUPPORTED_PAYMENT_CURRENCIES)[number];

export const DEFAULT_PAYMENT_CURRENCY: PaymentCurrency = "SOL";

export function isSupportedPaymentCurrency(value: unknown): value is PaymentCurrency {
  return typeof value === "string" && SUPPORTED_PAYMENT_CURRENCIES.includes(value as PaymentCurrency);
}
