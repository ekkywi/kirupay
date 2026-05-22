// src/app/pay/[id]/page.tsx
import prisma from "@/lib/neon";
import { notFound } from "next/navigation";
import { CheckoutCard } from "@/components/checkout/CheckoutCard";
import { ReceiptActions } from "@/components/checkout/ReceiptActions";
import { PlatformMaintenanceView } from "@/components/maintenance/PlatformMaintenanceView";
import { getPlatformMaintenanceState } from "@/lib/platform-maintenance";
import { resolveSolanaRpcConfig } from "@/lib/solana-rpc";
import { ShieldCheck, Lock, ArrowRight, ExternalLink, BadgeCheck, CalendarDays, ReceiptText, Network, Clock3, CircleCheckBig } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

function maskReference(value: string) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

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

  if (transaction.status === "PAID") {
    return {
      title: `Payment Receipt ${transaction.orderId} | Trezalink`,
      description: `Paid receipt for order ${transaction.orderId} with blockchain verification details.`,
    };
  }

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

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const isExpired = new Date(transaction.expiresAt).getTime() <= now;
  const isFailed = transaction.status === "FAILED";

  if (transaction.status === "PAID") {
    const rpcCluster = resolveSolanaRpcConfig("server").cluster;
    const clusterLabel = rpcCluster === "mainnet-beta" ? "Solana Mainnet" : rpcCluster === "testnet" ? "Solana Testnet" : "Solana Devnet";
    const explorerSuffix = rpcCluster === "mainnet-beta" ? "" : `?cluster=${rpcCluster}`;
    const paidAt = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(transaction.updatedAt);

    const explorerUrl = transaction.txSignature
      ? `https://explorer.solana.com/tx/${transaction.txSignature}${explorerSuffix}`
      : null;
    const shortSignature = transaction.txSignature
      ? `${transaction.txSignature.slice(0, 8)}...${transaction.txSignature.slice(-8)}`
      : null;

    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl p-7 sm:p-9 rounded-[2rem] shadow-2xl shadow-green-500/5 border border-white/20 dark:border-white/5 max-w-xl w-full animate-in zoom-in-95 duration-500">
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-green-500/30 ring-8 ring-green-50 dark:ring-green-500/10 text-white">
             <ShieldCheck size={40} strokeWidth={2.5}/>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Payment Receipt</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm leading-relaxed">
            Thank you for your purchase from <strong>{transaction.merchant.businessName}</strong>. Your transaction has been confirmed.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-gray-200/70 pb-3 dark:border-white/10">
              <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                Customer receipt
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <BadgeCheck className="h-3.5 w-3.5" />
                Paid
              </span>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
                <Network className="h-3 w-3" />
                {clusterLabel}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                transaction.txSignature
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
              }`}>
                {transaction.txSignature ? <CircleCheckBig className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                {transaction.txSignature ? "Proof ready" : "Proof pending"}
              </span>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Merchant</dt>
                <dd className="font-semibold text-gray-900 dark:text-white text-right">{transaction.merchant.businessName}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Order reference</dt>
                <dd className="font-mono font-semibold text-gray-900 dark:text-white text-right">{transaction.orderId}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400">Amount paid</dt>
                <dd className="font-semibold text-gray-900 dark:text-white text-right">{transaction.amount} SOL</dd>
              </div>
              {transaction.customerName ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">Customer</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white text-right">{transaction.customerName}</dd>
                </div>
              ) : null}
              {transaction.customerEmail ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="text-right text-xs font-medium text-gray-700 dark:text-gray-300">{transaction.customerEmail}</dd>
                </div>
              ) : null}
              {transaction.customerReference ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-gray-500 dark:text-gray-400">Customer reference</dt>
                  <dd className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 text-right">
                    {maskReference(transaction.customerReference)}
                  </dd>
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <dt className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Paid at (UTC)
                </dt>
                <dd className="font-semibold text-gray-900 dark:text-white text-right">{paidAt}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200/80 bg-gray-50/80 p-4 shadow-inner dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <ReceiptText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Payment confirmation state
            </div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Keep this receipt for support and reconciliation. You can verify the same transaction on a public Solana explorer.
            </p>

            {transaction.txSignature ? (
              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3.5 text-left dark:border-white/10 dark:bg-black/20">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    Confirmation state
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <BadgeCheck className="h-3 w-3" />
                    Confirmed
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  Blockchain transaction signature
                </p>
                <p className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {shortSignature}
                </p>
                <p className="mt-1 break-all font-mono text-xs font-medium text-gray-900 dark:text-white">
                  {transaction.txSignature}
                </p>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-[#222] dark:text-gray-200 dark:hover:bg-[#333]"
                >
                  Verify on Solana Explorer <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <p className="font-semibold">Proof pending synchronization</p>
                <p className="mt-1">
                  Payment is recorded as paid. Signature syncing is in progress. Refresh shortly to verify on Solana Explorer.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <ReceiptActions orderId={transaction.orderId} txSignature={transaction.txSignature} />
          </div>

          <div className="mt-6">
            <p className="mb-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Need help? Share your order reference and transaction signature with merchant support.
            </p>
          </div>

          {transaction.successUrl ? (
            <Link
              href={transaction.successUrl}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 py-4 rounded-xl font-bold text-sm transition-all shadow-md"
            >
              Return to Merchant <ArrowRight size={18} />
            </Link>
          ) : (
            <div className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-white/5 py-4 rounded-xl border border-gray-200/50 dark:border-white/5">
              You may now safely close this window.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isFailed || isExpired) {
    const expiredAtLocal = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(transaction.expiresAt));

    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4 overflow-hidden">
        <div className="relative z-10 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl p-7 sm:p-9 rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/5 max-w-xl w-full">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-5 text-red-600 dark:text-red-300">
            <Clock3 size={30} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Checkout expired</h1>
          <p className="mt-3 text-sm text-center text-gray-600 dark:text-gray-300">
            This payment session is no longer active and cannot be paid.
          </p>
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            Expired at: <span className="font-semibold">{expiredAtLocal}</span>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            Please create a new checkout from merchant app or API to continue payment.
          </p>
        </div>
      </div>
    );
  }

  // --- UI ENTERPRISE UNTUK HALAMAN CHECKOUT UTAMA (Tetap Sama) ---
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A] p-4 sm:p-8 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-[420px] md:max-w-[620px] lg:max-w-[760px] flex flex-col items-center">
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
