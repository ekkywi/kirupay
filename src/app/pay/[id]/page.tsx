// src/app/pay/[id]/page.tsx
import prisma from "@/lib/neon";
import { notFound } from "next/navigation";
import { CheckoutCard } from "@/components/checkout/CheckoutCard";
import { PlatformMaintenanceView } from "@/components/maintenance/PlatformMaintenanceView";
import { getPlatformMaintenanceState } from "@/lib/platform-maintenance";
import { ShieldCheck, Lock, ArrowRight, ExternalLink, Link2 } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const maintenance = await getPlatformMaintenanceState();

  if (maintenance.enabled) {
    return {
      title: "Maintenance Mode | Trezalink",
      description: maintenance.message,
    };
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { merchant: { select: { businessName: true } } }
  });

  if (!transaction) return { title: "Invoice Not Found | Trezalink" };

  return {
    title: `Pay ${transaction.amount} SOL to ${transaction.merchant.businessName}`,
    description: `Secure Web3 checkout powered by Trezalink for Order #${transaction.orderId}`,
  };
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const maintenance = await getPlatformMaintenanceState();

  if (maintenance.enabled) {
    return (
      <PlatformMaintenanceView
        message={maintenance.message}
        maintenanceEndsAt={maintenance.maintenanceEndsAt}
      />
    );
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: id },
    include: {
      merchant: {
        select: {
          businessName: true,
          walletAddress: true,
        }
      }
    }
  });

  if (!transaction) {
    notFound();
  }

  if (transaction.status === "PAID") {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 text-center bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl shadow-green-500/5 border border-white/20 dark:border-white/5 max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 ring-8 ring-green-50 dark:ring-green-500/10 text-white">
             <ShieldCheck size={40} strokeWidth={2.5}/>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Payment Successful!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
            Thank you for your purchase from <strong>{transaction.merchant.businessName}</strong>. Your transaction has been confirmed.
          </p>

          {transaction.txSignature && (
            <div className="mb-8 p-4 bg-gray-50/80 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-between text-left shadow-inner">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Link2 size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">Blockchain Receipt</p>
                  <p className="text-xs font-mono font-medium text-gray-900 dark:text-white mt-0.5">
                    {transaction.txSignature.substring(0, 6)}...{transaction.txSignature.slice(-6)}
                  </p>
                </div>
              </div>
              <a 
                href={`https://solscan.io/tx/${transaction.txSignature}?cluster=devnet`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white dark:bg-[#222] hover:bg-gray-100 dark:hover:bg-[#333] border border-gray-200 dark:border-[#444] rounded-xl text-[11px] font-bold text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                Verify <ExternalLink size={12} />
              </a>
            </div>
          )}
          
          {transaction.successUrl ? (
            <Link 
              href={transaction.successUrl}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 py-4 rounded-xl font-bold text-sm transition-all shadow-md"
            >
              Return to Merchant <ArrowRight size={18} />
            </Link>
          ) : (
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-white/5 py-4 rounded-xl border border-gray-200/50 dark:border-white/5">
              You may now safely close this window.
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- UI ENTERPRISE UNTUK HALAMAN CHECKOUT UTAMA (Tetap Sama) ---
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4 sm:p-8 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400">
          <Lock size={14} className="text-blue-500" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Secure Web3 Checkout</span>
        </div>

        <CheckoutCard transaction={transaction} />

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 p-2 px-4 rounded-full bg-white dark:bg-[#111] shadow-sm border border-gray-100 dark:border-white/5">
           <span>Powered by</span>
           <div className="flex items-center gap-1.5 text-gray-900 dark:text-white">
              <Lock size={13} className="text-blue-600 dark:text-blue-500" />
              <span className="font-bold tracking-tight">Trezalink</span>
           </div>
        </div>
      </div>
    </div>
  );
}