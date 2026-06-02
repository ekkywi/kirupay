// src/hooks/useMerchantUpdate.ts
import { useState } from "react";
import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";

type MerchantField = "businessName" | "webhookUrl";

export function useMerchantUpdate() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const updateField = async (field: MerchantField, value: string) => {
    if (!value) return false;
    
    setLoading(true);
    setStatus(null);
    
    try {
      const res = await fetch("/api/merchant/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.ok) {
        setStatus({ type: 'success', msg: 'Settings updated successfully!' });
        setTimeout(() => setStatus(null), 3000);
        return true;
      } else {
        const apiError = await parseApiErrorResponse(res);
        throw new Error(toDiagnosticMessage(apiError));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setStatus({ type: 'error', msg: message });
      setTimeout(() => setStatus(null), 3000);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateField, loading, status };
}
