"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Link as LinkIcon, Loader2, Unplug, Wallet, XCircle } from "lucide-react";
import { usePersonalWalletConnect } from "@/hooks/api/merchant/usePersonalWalletConnect";

export function PersonalLoginWalletCard({ initialWallet }: { initialWallet: string | null }) {
  const { wallet, isLoading, toast, handleConnect, executeDisconnect } = usePersonalWalletConnect(initialWallet);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const hasWallet = Boolean(wallet);
  const compact = hasWallet ? `${wallet!.slice(0, 6)}...${wallet!.slice(-4)}` : "Not linked";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-[#0B0F17] dark:shadow-none">
      {toast && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${toast.type === "success" ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-300" : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-slate-950 dark:text-white">Personal Login Wallet (Merchant)</h3>
      </div>

      <div className="mb-4 dashboard-muted-panel p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Status</p>
        <p className={`mt-1 font-mono text-sm ${hasWallet ? "font-bold text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>{compact}</p>
      </div>

      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        This wallet is only used to authenticate your merchant account. Business settlement wallets are managed in the Business Hub.
      </p>

      {hasWallet ? (
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={isLoading}
          className="w-full rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
        >
          {isLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <span className="inline-flex items-center gap-2"><Unplug className="h-4 w-4" /> Unlink Personal Wallet</span>}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <span className="inline-flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Connect Personal Wallet</span>}
        </button>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-[#0B0F17]">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-950 dark:text-white">Unlink personal wallet</h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  This only unlinks your personal login wallet and does not change any business settlement wallet.
                </p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10">Cancel</button>
              <button
                onClick={async () => {
                  const ok = await executeDisconnect();
                  if (ok) setShowConfirmModal(false);
                }}
                className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
