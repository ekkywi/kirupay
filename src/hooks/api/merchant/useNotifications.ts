import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";

export type MerchantNotification = {
  id: string;
  type: "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "PAYMENT_PENDING_TOO_LONG" | "WEBHOOK_DELIVERY_FAILED" | "WEBHOOK_RECOVERED";
  source: "PAYMENT" | "WEBHOOK";
  severity: "INFO" | "WARNING" | "ERROR";
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
};

const POLL_INTERVAL_MS = 10_000;
const AUTH_BACKOFF_MS = 60_000;

export function sortNotificationsByRecency(items: MerchantNotification[]) {
  return [...items].sort((a, b) => {
    const createdAtDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (createdAtDiff !== 0) return createdAtDiff;
    return b.id.localeCompare(a.id);
  });
}

export function useNotifications(options?: { isPanelOpen?: boolean }) {
  const isPanelOpen = Boolean(options?.isPanelOpen);
  const [items, setItems] = useState<MerchantNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const unreadInFlightRef = useRef(false);
  const listInFlightRef = useRef(false);
  const nextUnreadRetryAtRef = useRef(0);
  const isAuthenticatedRef = useRef(true);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());

  const refreshUnread = useCallback(async () => {
    if (unreadInFlightRef.current) return false;
    if (!isAuthenticatedRef.current && Date.now() < nextUnreadRetryAtRef.current) return false;
    unreadInFlightRef.current = true;
    try {
      const res = await fetch("/api/merchant/notifications/unread-count", { cache: "no-store" });
      if (res.status === 401) {
        isAuthenticatedRef.current = false;
        nextUnreadRetryAtRef.current = Date.now() + AUTH_BACKOFF_MS;
        return false;
      }
      if (!res.ok) throw new Error("Failed to fetch unread count");
      const json = (await res.json()) as { data: { unread: number } };
      setUnread(json.data.unread || 0);
      isAuthenticatedRef.current = true;
      nextUnreadRetryAtRef.current = 0;
      return true;
    } catch {
      return false;
    } finally {
      unreadInFlightRef.current = false;
    }
  }, []);

  const fetchNotifications = useCallback(async (nextCursor?: string | null, opts?: { silent?: boolean }) => {
    if (listInFlightRef.current) return false;
    listInFlightRef.current = true;
    setLoading(true);
    try {
      const query = new URLSearchParams({ limit: "20" });
      if (nextCursor) query.set("cursor", nextCursor);

      const res = await fetch(`/api/merchant/notifications?${query.toString()}`, { cache: "no-store" });
      if (res.status === 401) {
        isAuthenticatedRef.current = false;
        nextUnreadRetryAtRef.current = Date.now() + AUTH_BACKOFF_MS;
        return false;
      }
      if (!res.ok) {
        const apiError = await parseApiErrorResponse(res);
        throw new Error(toDiagnosticMessage(apiError));
      }
      isAuthenticatedRef.current = true;

      const json = (await res.json()) as {
        data: MerchantNotification[];
        pagination: { nextCursor: string | null; hasMore: boolean };
      };

      const incoming = json.data || [];

      if (typeof window !== "undefined" && !nextCursor) {
        const newPaymentSuccess = incoming.find(
          (item) => item.type === "PAYMENT_SUCCESS" && !seenNotificationIdsRef.current.has(item.id),
        );
        if (newPaymentSuccess) {
          const metadata = (newPaymentSuccess.metadata || {}) as Record<string, unknown>;
          const transactionId =
            typeof metadata.transactionId === "string" ? metadata.transactionId : null;
          const orderId = typeof metadata.orderId === "string" ? metadata.orderId : null;
          window.dispatchEvent(
            new CustomEvent("merchant:payment-updated", {
              detail: {
                notificationId: newPaymentSuccess.id,
                transactionId,
                orderId,
              },
            }),
          );
        }
      }

      setItems((prev) => {
        const merged = nextCursor ? [...prev, ...incoming] : incoming;
        return sortNotificationsByRecency(merged);
      });
      for (const item of incoming) {
        seenNotificationIdsRef.current.add(item.id);
      }
      setCursor(json.pagination?.nextCursor || null);
      setHasMore(Boolean(json.pagination?.hasMore));
      return true;
    } catch (error) {
      if (!opts?.silent) {
        console.error("Fetch notifications failed", error);
      }
      return false;
    } finally {
      listInFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (notificationId: string) => {
    await fetch("/api/merchant/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });

    setItems((prev) => prev.map((item) => (item.id === notificationId ? { ...item, readAt: new Date().toISOString() } : item)));
    setUnread((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch("/api/merchant/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });

    setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    setUnread(0);
  }, []);

  const unreadItems = useMemo(() => items.filter((item) => !item.readAt), [items]);

  useEffect(() => {
    if (!isAuthenticatedRef.current && Date.now() < nextUnreadRetryAtRef.current) return;
    const initialTick = window.setTimeout(() => {
      void refreshUnread();
    }, 0);
    const intervalId = window.setInterval(() => {
      void refreshUnread();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(intervalId);
    };
  }, [refreshUnread]);

  useEffect(() => {
    if (!isPanelOpen || !isAuthenticatedRef.current) return;
    const intervalId = window.setInterval(() => {
      void fetchNotifications(undefined, { silent: true });
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchNotifications, isPanelOpen]);

  return {
    items,
    unread,
    unreadItems,
    loading,
    cursor,
    hasMore,
    fetchNotifications,
    refreshUnread,
    markRead,
    markAllRead,
  };
}
