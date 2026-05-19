// src/hooks/api/merchant/useWebhookLogs.ts
import { useState, useEffect, useCallback } from "react";

export interface WebhookLog {
  id: string;
  event: string;
  url?: string | null;
  status: number | null;
  payload: string;
  response?: string | null;
  createdAt: string | Date;
}

export function useWebhookLogs(activeTab: string) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/merchant/webhook/logs");
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (error) {
      console.error("Gagal mengambil log webhook", error);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "logs") {
      const frame = requestAnimationFrame(() => {
        void fetchLogs();
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [activeTab, fetchLogs]);

  return { logs, isLoadingLogs, selectedLog, setSelectedLog, fetchLogs };
}
