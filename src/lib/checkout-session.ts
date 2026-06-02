export type CheckoutSessionState = {
  isExpired: boolean;
  isInactive: boolean;
  inactiveReason: "FAILED" | "EXPIRED" | null;
  expiresAtDate: Date | null;
};

export function toValidDate(value: unknown): Date | null {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isFinite(date.getTime()) ? date : null;
}

export function evaluateCheckoutSessionState(input: {
  status: string;
  expiresAt: unknown;
  nowMs?: number;
}): CheckoutSessionState {
  if (input.status === "PAID") {
    return {
      isExpired: false,
      isInactive: false,
      inactiveReason: null,
      expiresAtDate: toValidDate(input.expiresAt),
    };
  }

  const expiresAtDate = toValidDate(input.expiresAt);
  const nowMs = input.nowMs ?? Date.now();
  const isExpired = expiresAtDate ? expiresAtDate.getTime() <= nowMs : false;
  const isFailed = input.status === "FAILED";
  const isInactive = isFailed || isExpired;
  const inactiveReason = isFailed ? "FAILED" : isExpired ? "EXPIRED" : null;

  return {
    isExpired,
    isInactive,
    inactiveReason,
    expiresAtDate,
  };
}
