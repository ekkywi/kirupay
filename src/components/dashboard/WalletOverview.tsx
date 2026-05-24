"use client";

import { useState } from "react";
import { Wallet, Unplug, Link as LinkIcon, CheckCircle2, Loader2, AlertTriangle, XCircle, Coins } from "lucide-react";
import { useWalletConnect } from "@/hooks/api/merchant/useWalletConnect";

interface WalletOverviewProps {
  initialWallet: string | null;
  businessId?: string;
  canManage?: boolean;
}

export function WalletOverview({ initialWallet, businessId, canManage = true }: WalletOverviewProps) {
  const { wallet, balance, isFetchingBalance, isLoading, toast, handleConnect, executeDisconnect } = useWalletConnect(initialWallet, businessId);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isPending = !wallet || wallet.includes("pending");

  const formatWallet = (address: string | null) => {
    if (!address || address.includes("pending")) return "Not linked";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const onConfirmDisconnect = async () => {
    if (!canManage) return;
    const success = await executeDisconnect();
    if (success) {
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="relative bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm shadow-slate-200/60 dark:shadow-none">
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-top-5 fade-in duration-300 ${toast.type === "success" ? "bg-white dark:bg-[#0B0F17] border-green-200 dark:border-green-900/30" : "bg-white dark:bg-[#0B0F17] border-red-200 dark:border-red-900/30"}`}>
          <div className={`shrink-0 rounded-full flex items-center justify-center w-8 h-8 ${toast.type === "success" ? "bg-green-100 text-green-600 dark:bg-green-900/20" : "bg-red-100 text-red-600 dark:bg-red-900/20"}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          </div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{toast.message}</p>
        </div>
      )}

      {showConfirmModal && canManage && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-[#0B0F17] w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unlink Settlement Wallet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  Are you sure you want to unlink this settlement wallet? You will <strong className="text-red-500">stop receiving business payments</strong> until a new wallet is connected.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmModal(false)} disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors">Cancel</button>
                  <button onClick={onConfirmDisconnect} disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50">Yes, Unlink</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-slate-950 dark:text-white">Business Settlement Wallet</h3>
        </div>
        {!isPending && <CheckCircle2 className="w-5 h-5 text-green-500" />}
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03] flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Status</p>
          <p className={`font-mono text-sm ${isPending ? "text-gray-400" : "text-blue-600 dark:text-blue-400 font-bold"}`}>
            {formatWallet(wallet)}
          </p>
        </div>

        {!isPending && (
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center justify-end gap-1">
              <Coins size={12} /> Balance
            </p>
            {isFetchingBalance ? (
              <div className="flex items-center justify-end gap-1 text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs font-mono">Syncing...</span>
              </div>
            ) : (
              <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{balance !== null ? `${balance.toFixed(4)} SOL` : "0.0000 SOL"}</p>
            )}
          </div>
        )}
      </div>

      {!canManage && (
        <p className="mb-3 text-xs font-semibold text-amber-700 dark:text-amber-300">Owner-only action: connect/unlink wallet is disabled for your role.</p>
      )}

      {isPending ? (
        <button
          onClick={() => {
            if (!canManage) return;
            void handleConnect();
          }}
          disabled={isLoading || !canManage}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LinkIcon className="w-4 h-4" /> Connect Settlement Wallet</>}
        </button>
      ) : (
        <button
          onClick={() => {
            if (!canManage) return;
            setShowConfirmModal(true);
          }}
          disabled={isLoading || !canManage}
          className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Unplug className="w-4 h-4" /> Unlink Settlement Wallet</>}
        </button>
      )}
    </div>
  );
}
