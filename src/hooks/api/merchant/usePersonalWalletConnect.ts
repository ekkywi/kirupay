import { useState } from "react";
import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";

type SolanaProvider = {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
};

type WalletUpdateResponse = {
  walletAddress: string | null;
};

export function usePersonalWalletConnect(initialWallet: string | null) {
  const [wallet, setWallet] = useState(initialWallet);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const provider = (window as { solana?: SolanaProvider }).solana;
      if (!provider || !provider.isPhantom) {
        throw new Error("Phantom wallet extension not found. Please install it.");
      }

      const resp = await provider.connect();
      const pubKey = resp.publicKey.toString();
      const message = `Sign this message to link your personal login wallet to Trezalink.\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await provider.signMessage(encodedMessage, "utf8");
      const signatureBase58 = (await import("bs58")).default.encode(signedMessage.signature);

      const res = await fetch("/api/merchant/profile/wallet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", publicKey: pubKey, signature: signatureBase58, message }),
      });

      if (!res.ok) {
        const apiError = await parseApiErrorResponse(res);
        throw new Error(toDiagnosticMessage(apiError));
      }

      const data = (await res.json()) as WalletUpdateResponse;
      setWallet(data.walletAddress);
      showToast("Personal login wallet connected.", "success");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect personal wallet.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const executeDisconnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/merchant/profile/wallet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink" }),
      });

      if (!res.ok) {
        const apiError = await parseApiErrorResponse(res);
        throw new Error(toDiagnosticMessage(apiError));
      }

      const data = (await res.json()) as WalletUpdateResponse;
      setWallet(data.walletAddress);

      const provider = (window as { solana?: SolanaProvider }).solana;
      if (provider) await provider.disconnect();

      showToast("Personal login wallet unlinked.", "success");
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to disconnect personal wallet.";
      showToast(errorMessage, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { wallet, isLoading, toast, handleConnect, executeDisconnect };
}
