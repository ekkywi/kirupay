// src/hooks/web3/useSolanaCheckout.ts
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { WalletError } from "@solana/wallet-adapter-base";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { withRpcFailover } from "@/lib/solana-rpc";

export interface CheckoutTransaction {
  id: string;
  amount: number;
  merchant: {
    walletAddress: string;
  };
}

const PLATFORM_FEE_PERCENTAGE = 0.003; // 0.3%
const DEFAULT_TREASURY_ERROR = "System Configuration Error: Treasury wallet is missing.";
const GENERAL_PAYMENT_ERROR = "Payment failed or was cancelled by the user.";

export function useSolanaCheckout(transaction: CheckoutTransaction) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connection } = useConnection();
  const { publicKey, wallet, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handlePayment = async () => {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_WALLET;
      if (!treasuryAddress) {
        throw new Error(DEFAULT_TREASURY_ERROR);
      }

      const merchantPubKey = new PublicKey(transaction.merchant.walletAddress);
      const treasuryPubKey = new PublicKey(treasuryAddress);
      const totalLamports = Math.round(transaction.amount * LAMPORTS_PER_SOL);
      const feeLamports = Math.round(totalLamports * PLATFORM_FEE_PERCENTAGE); 
      const merchantLamports = totalLamports - feeLamports; 
      
      const tx = new Transaction();

      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: merchantPubKey,
          lamports: merchantLamports,
        })
      );

      if (feeLamports > 0) {
        tx.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: treasuryPubKey,
            lamports: feeLamports,
          })
        );
      }

      const latestBlockhash = await withRpcFailover("checkout.getLatestBlockhash", async (rpcConnection) => {
        return rpcConnection.getLatestBlockhash("confirmed");
      });
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);

      const confirmation = await withRpcFailover("checkout.confirmTransaction", async (rpcConnection) => {
        return rpcConnection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed",
        );
      });

      if (confirmation.value.err) {
        throw new Error("Transaction confirmed but resulted in an error on-chain.");
      }

      const res = await fetch("/api/internal/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transaction.id,
          signature: signature,
          buyerWallet: publicKey.toBase58(),
          walletProvider: wallet?.adapter?.name || "Unknown",
        }),
      });

      if (!res.ok) {
        throw new Error("Transaction recorded on the blockchain, but failed to sync with the server.");
      }

      setSuccess(true);

    } catch (err: unknown) {
      let displayMessage = GENERAL_PAYMENT_ERROR;

      if (err instanceof WalletError) {
        displayMessage = err.message || displayMessage;
      } else if (err instanceof Error) {
        displayMessage = err.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("[Solana Checkout Error]:", err);
      }

      setError(displayMessage); 
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, error, connected, handlePayment };
}
