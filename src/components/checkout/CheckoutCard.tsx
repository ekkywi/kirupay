// src/components/checkout/CheckoutCard.tsx
"use client";

import { Wallet, ArrowRight, CheckCircle2, AlertTriangle, Loader2, Copy } from "lucide-react";
import { useSolanaCheckout } from "@/hooks/web3/useSolanaCheckout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Transaction } from "@prisma/client";

type CheckoutTransaction = Pick<Transaction, "amount" | "orderId"> & {
  merchant: {
    businessName: string;
  };
};

type CheckoutHookResult = {
  loading: boolean;
  success: boolean;
  error: string | null;
  connected: boolean;
  handlePayment: () => Promise<void>;
};

export function CheckoutCard({ transaction }: { transaction: CheckoutTransaction }) {
  const router = useRouter();
  const { loading, success, error, connected, handlePayment } = useSolanaCheckout(transaction) as CheckoutHookResult;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (success) {
      router.refresh();
    }
  }, [success, router]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(transaction.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="w-full bg-white/90 dark:bg-[#111111]/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-white/60 dark:border-white/10 p-10 text-center animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-25"></div>
          <Loader2 size={28} className="animate-spin relative z-10" />
        </div>
        
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight animate-pulse">
          Payment Detected
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[260px] leading-relaxed font-medium">
          Finalizing transaction blocks on Solana. Preparing your secure receipt...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/90 dark:bg-[#111111]/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-white/60 dark:border-white/10 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

      <div className="pt-10 pb-6 px-8 flex flex-col items-center border-b border-gray-100 dark:border-white/5">
        <div className="w-14 h-14 rounded-full bg-white dark:bg-[#222] border border-gray-200 dark:border-[#333] flex items-center justify-center text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-4 shadow-sm">
          {transaction.merchant.businessName.charAt(0).toUpperCase()}
        </div>
        
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Paying to <span className="font-bold text-gray-900 dark:text-white">{transaction.merchant.businessName}</span>
        </p>

        <div className="flex items-baseline gap-1.5 mb-5 mt-2">
          <span className="text-[48px] leading-none font-bold tracking-tighter text-gray-900 dark:text-white">
            {transaction.amount}
          </span>
          <span className="text-lg font-bold text-gray-400 dark:text-gray-500 tracking-wide">
            SOL
          </span>
        </div>

        <button 
          onClick={copyOrderId}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full border border-gray-200/50 dark:border-white/5 transition-colors group"
        >
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Ref: <span className="font-mono text-gray-900 dark:text-white ml-1 tracking-normal">{transaction.orderId.substring(0, 10)}</span></span>
          {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} className="text-gray-400 group-hover:text-gray-600" />}
        </button>
      </div>

      <div className="p-6 sm:p-8 bg-transparent">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-medium flex items-start gap-3 animate-in fade-in">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span className="break-words leading-relaxed">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-[13px] text-gray-500 dark:text-gray-400 text-center mb-6 px-4">
            Connect your secure browser wallet (Phantom, Backpack, Solflare) to approve this transaction.
          </p>

          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-4.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg group ${
              connected 
                ? "bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 shadow-gray-900/20" 
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white shadow-blue-500/30"
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Confirming in Wallet...</span>
              </>
            ) : (
              <>
                <Wallet size={20} className={connected ? "" : "text-white/80"} />
                <span>{connected ? "Pay with Wallet" : "Connect Wallet"}</span>
                <ArrowRight size={18} className="ml-1 opacity-60 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 px-6 font-medium">
            By proceeding, you agree to execute a smart contract on the Solana blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}
