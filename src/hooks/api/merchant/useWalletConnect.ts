// src/hooks/api/merchant/useWalletConnect.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { withRpcFailover } from "@/lib/solana-rpc";
import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";

type SolanaProvider = {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
};

type WalletUpdateResponse = {
  walletAddress: string;
};

export function useWalletConnect(initialWallet: string) {
  const router = useRouter();
  const [wallet, setWallet] = useState(initialWallet);
  const [balance, setBalance] = useState<number | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBalance = async (walletAddress: string) => {
    if (walletAddress.includes("pending")) return;
    
    setIsFetchingBalance(true);
    try {
      const pubKey = new PublicKey(walletAddress);

      const lamports = await withRpcFailover("wallet.getBalance", async (connection) => {
        return connection.getBalance(pubKey, "confirmed");
      });
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Gagal mengambil saldo", error);
      setBalance(null);
    } finally {
      setIsFetchingBalance(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const syncBalance = async () => {
      if (wallet.includes("pending")) {
        if (!cancelled) setBalance(null);
        return;
      }
      await fetchBalance(wallet);
    };

    void syncBalance();
    return () => {
      cancelled = true;
    };
  }, [wallet]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const provider = (window as { solana?: SolanaProvider }).solana;
      if (!provider || !provider.isPhantom) {
        throw new Error("Phantom wallet extension not found. Please install it.");
      }

      const resp = await provider.connect();
      const pubKey = resp.publicKey.toString();
      const message = `Sign this message to link your wallet to Trezalink.\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await provider.signMessage(encodedMessage, "utf8");
      const signatureBase58 = (await import('bs58')).default.encode(signedMessage.signature);
      
      const res = await fetch("/api/merchant/wallet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "link", publicKey: pubKey, signature: signatureBase58, message })
      });
      
      if (!res.ok) {
        const apiError = await parseApiErrorResponse(res);
        throw new Error(toDiagnosticMessage(apiError));
      }

      const data = (await res.json()) as WalletUpdateResponse;

      setWallet(data.walletAddress);
      router.refresh();
      showToast("Wallet connected successfully!", "success");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const executeDisconnect = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/merchant/wallet/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink" })
      });

      if (!res.ok) {
        const apiError = await parseApiErrorResponse(res);
        throw new Error(toDiagnosticMessage(apiError));
      }

      const data = (await res.json()) as WalletUpdateResponse;

      setWallet(data.walletAddress);
      setBalance(null);
      
      const provider = (window as { solana?: SolanaProvider }).solana;
      if (provider) await provider.disconnect();
      
      router.refresh();
      showToast("Wallet unlinked successfully!", "success");
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to disconnect wallet.";
      showToast(errorMessage, "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { wallet, balance, isFetchingBalance, isLoading, toast, handleConnect, executeDisconnect };
}
