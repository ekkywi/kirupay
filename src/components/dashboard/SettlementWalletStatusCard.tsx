"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Wallet } from "lucide-react";

export function SettlementWalletStatusCard({ walletAddress }: { walletAddress: string | null }) {
  const hasWallet = Boolean(walletAddress);
  const compactAddress = hasWallet ? `${walletAddress!.slice(0, 6)}...${walletAddress!.slice(-4)}` : "Not linked";

  return (
    <div className="relative dashboard-card p-5 shadow-sm shadow-emerald-950/5 dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-slate-950 dark:text-white">Business Settlement Wallet (Active Business)</h3>
        </div>
        {hasWallet && <CheckCircle2 className="w-5 h-5 text-green-500" />}
      </div>

      <div className="mb-3 dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Status</p>
        <p className={`font-mono text-sm ${hasWallet ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-400"}`}>{compactAddress}</p>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        This wallet is used for payouts and settlement on the active business. It is separate from your personal login wallet.
      </p>

      <Link
        href="/business"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Manage in Business Hub
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
