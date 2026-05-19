// src/hooks/api/merchant/useCredentialsManager.ts
import { useState } from "react";

export function useCredentialsManager(initialApiKey?: string | null, initialWebhookSecret?: string | null) {
  const [currentKey, setCurrentKey] = useState(initialApiKey || "API_KEY_NOT_GENERATED");
  const [currentWebhookSecret, setCurrentWebhookSecret] = useState(initialWebhookSecret || "WEBHOOK_SECRET_NOT_GENERATED");
  
  const [isRollingKey, setIsRollingKey] = useState(false);
  const [isRollingWebhook, setIsRollingWebhook] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied successfully!`, "success");
  };

  const executeRollKey = async () => {
    setIsRollingKey(true);
    try {
      const res = await fetch("/api/merchant/apikey/regenerate", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        setCurrentKey(data.apiKey);
        showToast("API Key updated successfully!", "success");
        return true;
      } else {
        showToast(data.error || "Failed to update API Key.", "error");
        return false;
      }
    } catch {
      showToast("A network error occurred. Please try again.", "error");
      return false;
    } finally {
      setIsRollingKey(false);
    }
  };

  const executeRollWebhookSecret = async () => {
    setIsRollingWebhook(true);
    try {
      const res = await fetch("/api/merchant/webhook/regenerate", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        setCurrentWebhookSecret(data.webhookSecret);
        showToast("Webhook Secret updated successfully!", "success");
        return true;
      } else {
        showToast(data.error || "Failed to update Webhook Secret.", "error");
        return false;
      }
    } catch {
      showToast("A network error occurred. Please try again.", "error");
      return false;
    } finally {
      setIsRollingWebhook(false);
    }
  };

  return {
    currentKey, currentWebhookSecret,
    isRollingKey, isRollingWebhook,
    toast, handleCopy,
    executeRollKey, executeRollWebhookSecret
  };
}
