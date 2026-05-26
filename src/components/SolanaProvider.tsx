// src/components/SolanaProvider.tsx
"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { resolveSolanaRpcConfig } from "@/lib/solana-rpc";

import "@solana/wallet-adapter-react-ui/styles.css";

let hasWarnedWalletSecurityError = false;

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const network = useMemo(() => resolveSolanaRpcConfig().primary, []);

  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  const handleWalletError = (error: Error) => {
    const isSecurityError =
      error.name === "SecurityError" ||
      error.message.includes("The operation is insecure") ||
      error.message.includes("localStorage");

    if (isSecurityError) {
      if (process.env.NODE_ENV !== "production" && !hasWarnedWalletSecurityError) {
        hasWarnedWalletSecurityError = true;
        console.warn("SolanaProvider: wallet storage access blocked by browser policy. Wallet persistence may be disabled.");
      }
      return;
    }

    console.error("Wallet provider error", error);
  };

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect onError={handleWalletError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
