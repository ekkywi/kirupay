import { useEffect, useMemo, useState } from "react";
import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";

export type NotificationPreferences = {
  paymentSuccess: boolean;
  paymentFailed: boolean;
  paymentPendingTooLong: boolean;
  webhookDeliveryFailed: boolean;
  webhookRecovered: boolean;
};

const DEFAULT_PREFS: NotificationPreferences = {
  paymentSuccess: true,
  paymentFailed: true,
  paymentPendingTooLong: true,
  webhookDeliveryFailed: true,
  webhookRecovered: true,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [initial, setInitial] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/merchant/notification-preferences", { cache: "no-store" });
        if (!res.ok) {
          const apiError = await parseApiErrorResponse(res);
          throw new Error(toDiagnosticMessage(apiError));
        }

        const json = (await res.json()) as { data: NotificationPreferences };
        if (!active) return;

        setPreferences({ ...DEFAULT_PREFS, ...(json.data || {}) });
        setInitial({ ...DEFAULT_PREFS, ...(json.data || {}) });
      } catch {
        if (!active) return;
        setPreferences(DEFAULT_PREFS);
        setInitial(DEFAULT_PREFS);
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const changed = useMemo(() => {
    return Object.keys(DEFAULT_PREFS).some((key) => {
      const typed = key as keyof NotificationPreferences;
      return preferences[typed] !== initial[typed];
    });
  }, [initial, preferences]);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        const apiError = await parseApiErrorResponse(res);
        throw new Error(toDiagnosticMessage(apiError));
      }

      setInitial(preferences);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    preferences,
    loading,
    changed,
    setPreferences,
    save,
  };
}
