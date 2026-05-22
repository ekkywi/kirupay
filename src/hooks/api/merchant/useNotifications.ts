import { useCallback, useMemo, useState } from "react";
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

function severityRank(severity: MerchantNotification["severity"]) {
  if (severity === "ERROR") return 3;
  if (severity === "WARNING") return 2;
  return 1;
}

function sortNotifications(items: MerchantNotification[]) {
  return [...items].sort((a, b) => {
    const rankDiff = severityRank(b.severity) - severityRank(a.severity);
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function useNotifications() {
  const [items, setItems] = useState<MerchantNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/notifications/unread-count", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch unread count");
      const json = (await res.json()) as { data: { unread: number } };
      setUnread(json.data.unread || 0);
    } catch {
      setUnread(0);
    }
  }, []);

  const fetchNotifications = useCallback(async (nextCursor?: string | null) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ limit: "20" });
      if (nextCursor) query.set("cursor", nextCursor);

      const res = await fetch(`/api/merchant/notifications?${query.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const apiError = await parseApiErrorResponse(res);
        throw new Error(toDiagnosticMessage(apiError));
      }

      const json = (await res.json()) as {
        data: MerchantNotification[];
        pagination: { nextCursor: string | null; hasMore: boolean };
      };

      const incoming = json.data || [];
      const merged = nextCursor ? [...items, ...incoming] : incoming;
      setItems(sortNotifications(merged));
      setCursor(json.pagination?.nextCursor || null);
      setHasMore(Boolean(json.pagination?.hasMore));
    } finally {
      setLoading(false);
    }
  }, [items]);

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
