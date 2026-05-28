"use client";

import { ShieldAlert, ShieldCheck, X, AlertTriangle, UserCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleMerchantStatus } from "@/app/(main)/admin/merchants/actions/merchant";
import { toast } from "sonner";

export function SuspendButton({ merchantId, isActive }: { merchantId: string, isActive: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    
    startTransition(async () => {
      const toastId = toast.loading(`${isActive ? 'Suspending' : 'Activating'} merchant...`);
      
      const result = await toggleMerchantStatus(merchantId, isActive);

      if (result.success) {
        toast.success(
          isActive 
            ? `${result.businessName} has been suspended.` 
            : `${result.businessName} is now active.`,
          { id: toastId }
        );
      } else {
        toast.error(`Error: ${result.error}`, { id: toastId });
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className={`rounded-lg p-2 transition-colors ${
          isActive
            ? "text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
        } ${isPending ? "cursor-not-allowed opacity-50" : ""}`}
        title={isActive ? "Suspend Merchant" : "Re-activate Merchant"}
      >
        {isActive ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto dashboard-card shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-white/[0.045] animate-in zoom-in-95 duration-200">
            <div className="relative p-6 pb-3 text-center">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <X size={18} />
              </button>
              
              <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                isActive 
                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300" 
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
              }`}>
                {isActive ? <AlertTriangle size={32} strokeWidth={2.5} /> : <UserCheck size={32} strokeWidth={2.5} />}
              </div>

              <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                {isActive ? "Confirm Account Suspension" : "Confirm Account Reactivation"}
              </h3>
            </div>

            <div className="px-6 pb-6 text-center">
              <p className="break-words whitespace-normal text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {isActive 
                  ? "Are you sure? This will instantly revoke their API access. All existing checkout sessions and future API calls for this merchant will be blocked immediately."
                  : "Are you sure? This will restore their API access. They will be able to process transactions and use the Trezalink network again."}
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-b-2xl border-t border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row">
              <button
                onClick={() => setShowModal(false)}
                className="order-2 w-full dashboard-secondary px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] sm:order-1"
              >
                Cancel, keep as is
              </button>
              <button
                onClick={handleConfirm}
                className={`order-1 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors sm:order-2 ${
                  isActive 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isActive ? "Yes, Suspend Access" : "Yes, Reactivate Access"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
