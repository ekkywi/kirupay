"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type PaymentsAutoRefreshProps = {
  fallbackIntervalMs?: number;
  cooldownMs?: number;
};

export function PaymentsAutoRefresh({
  fallbackIntervalMs = 20_000,
  cooldownMs = 2_500,
}: PaymentsAutoRefreshProps) {
  const router = useRouter();
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    const refreshIfAllowed = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      const now = Date.now();
      if (now - lastRefreshAtRef.current < cooldownMs) return;
      lastRefreshAtRef.current = now;
      router.refresh();
    };

    const onPaymentUpdated = () => {
      refreshIfAllowed();
    };

    window.addEventListener("merchant:payment-updated", onPaymentUpdated);

    const intervalId = window.setInterval(() => {
      refreshIfAllowed();
    }, fallbackIntervalMs);

    return () => {
      window.removeEventListener("merchant:payment-updated", onPaymentUpdated);
      window.clearInterval(intervalId);
    };
  }, [cooldownMs, fallbackIntervalMs, router]);

  return null;
}
