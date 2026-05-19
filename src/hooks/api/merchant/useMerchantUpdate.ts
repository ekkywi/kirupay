// src/hooks/useMerchantUpdate.ts
import { useState } from "react";

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
        throw new Error("Failed to update");
      }
    } catch {
      setStatus({ type: 'error', msg: 'Something went wrong. Please try again.' });
      setTimeout(() => setStatus(null), 3000);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateField, loading, status };
}
