export function formatCurrencyNumber(currency: string, value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "-";

  if (currency === "USDC") {
    const rounded = Number(value.toFixed(6));
    const [, decimalPartRaw = ""] = rounded.toFixed(6).split(".");
    const trimmed = decimalPartRaw.replace(/0+$/, "");
    const decimals = Math.min(6, Math.max(2, trimmed.length));
    return Number(value).toFixed(decimals);
  }

  return Number(value).toFixed(4);
}

export function formatCurrencyDisplay(currency: string, value: number | null | undefined) {
  const formatted = formatCurrencyNumber(currency, value);
  if (formatted === "-") return "-";
  return `${formatted} ${currency}`;
}
