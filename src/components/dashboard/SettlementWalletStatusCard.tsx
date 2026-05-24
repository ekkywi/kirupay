"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Wallet } from "lucide-react";

export function SettlementWalletStatusCard({ walletAddress }: { walletAddress: string | null }) {
  const hasWallet = Boolean(walletAddress);
  const compactAddress = hasWallet ? `${walletAddress!.slice(0, 6)}...${walletAddress!.slice(-4)}` : "Not linked";

  return (
    <div className="relative bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm shadow-slate-200/60 dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-slate-950 dark:text-white">Business Settlement Wallet (Active Business)</h3>
        </div>
        {hasWallet && <CheckCircle2 className="w-5 h-5 text-green-500" />}
      </div>

      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Status</p>
        <p className={`font-mono text-sm ${hasWallet ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-400"}`}>{compactAddress}</p>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        This wallet is used for payouts and settlement on the active business. It is separate from your personal login wallet.
      </p>

      <Link
        href="/business"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Manage in Business Hub
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
