import { formatCurrencyDisplay } from "@/lib/currency-format";
import { SUPPORTED_PAYMENT_CURRENCIES } from "@/lib/payment-currencies";

type CurrencyAmountField = "amount" | "feeAmount" | "netAmount";

type CurrencyAggregateRow = {
  currency: string;
  _sum: Partial<Record<CurrencyAmountField, number | null>>;
  _count?: { id: number };
};

export type CurrencyBreakdownEntry = {
  currency: string;
  value: number;
};

function isSupportedCurrency(currency: string) {
  return SUPPORTED_PAYMENT_CURRENCIES.includes(currency as (typeof SUPPORTED_PAYMENT_CURRENCIES)[number]);
}

function getOrderedCurrencies(entries: Map<string, number>) {
  const supported = SUPPORTED_PAYMENT_CURRENCIES.filter((currency) => entries.has(currency));
  const extras = Array.from(entries.keys())
    .filter((currency) => !isSupportedCurrency(currency))
    .sort((a, b) => a.localeCompare(b));

  return [...supported, ...extras];
}

export function buildCurrencyBreakdown(rows: CurrencyAggregateRow[], field: CurrencyAmountField): CurrencyBreakdownEntry[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const value = row._sum[field] ?? 0;
    if (value <= 0) continue;
    totals.set(row.currency, (totals.get(row.currency) ?? 0) + value);
  }

  return getOrderedCurrencies(totals).map((currency) => ({
    currency,
    value: totals.get(currency) ?? 0,
  }));
}

export function formatCurrencyBreakdown(rows: CurrencyAggregateRow[], field: CurrencyAmountField) {
  const breakdown = buildCurrencyBreakdown(rows, field);
  if (breakdown.length === 0) return "-";

  return breakdown.map(({ currency, value }) => formatCurrencyDisplay(currency, value)).join(" • ");
}

export function formatCurrencyAverageBreakdown(rows: CurrencyAggregateRow[], field: CurrencyAmountField) {
  const entries = rows
    .map((row) => {
      const count = row._count?.id ?? 0;
      if (count <= 0) return null;

      const average = (row._sum[field] ?? 0) / count;
      return average > 0 ? formatCurrencyDisplay(row.currency, average) : null;
    })
    .filter((value): value is string => Boolean(value));

  if (entries.length === 0) return "-";

  return entries.join(" • ");
}
