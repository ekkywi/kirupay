// src/hooks/api/transactions/useCreatePaymentLink.ts
import { useState } from "react";
import { createManualPaymentLink } from "@/app/actions/payment-link";

export function useCreatePaymentLink(businessId: string) {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const generateLink = async (formData: FormData) => {
    setLoading(true);
    setErrorMsg("");
    
    try {
      const result = await createManualPaymentLink({
        businessId,
        amount: parseFloat(formData.get("amount") as string),
        orderId: formData.get("orderId") as string,
        customerReference: formData.get("customerReference") as string,
        customerName: formData.get("customerName") as string,
        notes: formData.get("notes") as string,
        // customerEmail: formData.get("email") as string,
      });

      if (result.success) {
        const url = `${window.location.origin}/pay/${result.transactionId}`;
        setGeneratedLink(url);
        return true;
      } else {
        const diagnostic = result.diagnostics
          ? `${result.error} (requestId: ${result.diagnostics.requestId})`
          : result.error;
        setErrorMsg(diagnostic || "An error occurred while generating the link.");
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Network or server error.";
      setErrorMsg(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setGeneratedLink("");
    setErrorMsg("");
  };

  return { loading, generatedLink, errorMsg, generateLink, resetState };
}
