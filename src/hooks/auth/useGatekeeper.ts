// src/hooks/auth/useGatekeeper.ts
import { useState } from "react";
import { throwAuthResponseError } from "@/lib/auth-client-error";

type CompleteProfilePayload = {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
};

export function useGatekeeper(merchantId: string, currentEmail: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success" | "", text: string }>({ type: "", text: "" });

  const completeProfile = async (data: CompleteProfilePayload) => {
    setIsLoading(true);
    setStatusMsg({ type: "", text: "" });

    if (data.password !== data.confirmPassword) {
      setStatusMsg({ type: "error", text: "Passwords do not match. Please try again." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          merchantId, 
          email: data.email, 
          password: data.password, 
          businessName: data.businessName 
        })
      });

      if (!res.ok) await throwAuthResponseError(res, "Failed to complete profile.");

      setStatusMsg({ type: "success", text: "Verification email sent! Please check your inbox." });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete profile.";
      setStatusMsg({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    setIsLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/profile/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, email: currentEmail })
      });

      if (!res.ok) await throwAuthResponseError(res, "Failed to resend email.");

      setStatusMsg({ type: "success", text: "Verification email re-sent! Please check your inbox." });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resend email.";
      setStatusMsg({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, statusMsg, completeProfile, resendVerification };
}
