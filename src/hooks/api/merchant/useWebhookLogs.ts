// src/hooks/api/merchant/useWebhookLogs.ts
import { useState, useEffect, useCallback } from "react";
import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";

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
      const errorRes = res.clone();
      const json = await res.json();
      if (res.ok && json.success) {
        setLogs(json.data);
      } else {
        const apiError = await parseApiErrorResponse(errorRes);
        console.error("Webhook logs fetch failed", toDiagnosticMessage(apiError));
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
