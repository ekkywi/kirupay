// src/components/dashboard/CreateLinkButton.tsx
"use client";

import { useState } from "react";
import { Plus, Copy, Check, AlertCircle } from "lucide-react";
import { useCreatePaymentLink } from "@/hooks/api/transactions/useCreatePaymentLink";

export function CreateLinkButton({ businessId }: { businessId: string }) {
  const { loading, generatedLink, errorMsg, generateLink, resetState } = useCreatePaymentLink(businessId);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await generateLink(formData);
  };

  const closeAndReset = () => {
    setIsOpen(false);
    resetState();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        <Plus size={18} /> Create link
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white dark:bg-[#0B0F17] w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">No-code checkout</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Create payment link</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Generate a hosted SOL checkout URL for invoices or direct collection.</p>
            </div>
            
            {/* TAMPILKAN BANNER ERROR */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-xs font-medium">{errorMsg}</p>
              </div>
            )}

            {!generatedLink ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Amount (SOL)*</label>
                  <input name="amount" type="number" step="0.000000001" min="0" required className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all dark:text-white" placeholder="0.1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Reference / Order ID (Optional)</label>
                  <input name="orderId" type="text" className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all dark:text-white" placeholder="e.g. INV-001" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Customer reference (Optional)</label>
                  <input name="customerReference" type="text" maxLength={80} className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all dark:text-white" placeholder="e.g. CUST-REF-001" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Customer name (Optional)</label>
                  <input name="customerName" type="text" maxLength={80} className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all dark:text-white" placeholder="e.g. Avery Stone" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Notes (Optional)</label>
                  <textarea name="notes" maxLength={300} rows={3} className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all dark:text-white resize-none" placeholder="Internal context for support/reconciliation" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeAndReset} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20">
                    {loading ? "Generating..." : "Generate Link"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check size={32} />
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Payment link ready to share!</p>
                
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200 dark:border-white/10">
                  <input readOnly value={generatedLink} className="bg-transparent flex-1 outline-none text-xs font-mono dark:text-gray-300" />
                  <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-700 transition-colors p-1">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                <button onClick={closeAndReset} className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
