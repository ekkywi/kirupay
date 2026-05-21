// src/components/checkout/CheckoutCard.tsx
"use client";

import { Wallet, ArrowRight, CheckCircle2, AlertTriangle, Loader2, Copy, ShieldCheck, QrCode, ExternalLink, Smartphone } from "lucide-react";
import { useSolanaCheckout } from "@/hooks/web3/useSolanaCheckout";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Transaction } from "@prisma/client";
import type { CheckoutTransaction as HookCheckoutTransaction } from "@/hooks/web3/useSolanaCheckout";
import QRCode from "qrcode";

type CheckoutTransaction = Pick<Transaction, "id" | "amount" | "orderId"> & {
  merchant: {
    businessName: string;
    walletAddress: string;
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
  const paymentTransaction: HookCheckoutTransaction = {
    id: transaction.id,
    amount: transaction.amount,
    merchant: { walletAddress: transaction.merchant.walletAddress },
  };
  const { loading, success, error, connected, handlePayment } = useSolanaCheckout(paymentTransaction) as CheckoutHookResult;
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedCheckoutUrl, setCopiedCheckoutUrl] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (success) {
      router.refresh();
    }
  }, [success, router]);

  const checkoutUrl = useMemo(() => {
    const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || runtimeOrigin).replace(/\/$/, "");
    return `${baseUrl}/pay/${transaction.id}`;
  }, [transaction.id]);

  const phantomBrowseUrl = useMemo(() => {
    const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || runtimeOrigin).replace(/\/$/, "");
    const refUrl = runtimeOrigin || baseUrl;

    return `https://phantom.app/ul/browse/${encodeURIComponent(checkoutUrl)}?ref=${encodeURIComponent(refUrl)}`;
  }, [checkoutUrl]);

  useEffect(() => {
    let active = true;

    void QRCode.toDataURL(checkoutUrl, {
      errorCorrectionLevel: "Q",
      margin: 4,
      width: 560,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }).then((url) => {
      if (active) {
        setQrDataUrl(url);
      }
    }).catch(() => {
      if (active) {
        setQrDataUrl("");
      }
    });

    return () => {
      active = false;
    };
  }, [checkoutUrl]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(transaction.orderId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const copyCheckoutUrl = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopiedCheckoutUrl(true);
    setTimeout(() => setCopiedCheckoutUrl(false), 2000);
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
          Finishing payment confirmation. Receipt appears now, and on-chain proof follows shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-2xl shadow-gray-200/50 backdrop-blur-2xl dark:border-white/10 dark:bg-[#111111]/90 dark:shadow-black/50">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

      <div className="border-b border-gray-100 px-6 pb-5 pt-7 dark:border-white/5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-black text-transparent shadow-sm bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-600 dark:border-[#333] dark:bg-[#222] dark:from-blue-400 dark:to-cyan-300">
            {transaction.merchant.businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Paying to</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{transaction.merchant.businessName}</p>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-1.5">
          <span className="text-[42px] font-bold leading-none tracking-tighter text-gray-900 dark:text-white">
            {transaction.amount}
          </span>
          <span className="pb-1 text-sm font-bold tracking-[0.12em] text-gray-400 dark:text-gray-500">
            SOL
          </span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
            <ShieldCheck className="h-3 w-3" />
            Trusted checkout
          </div>
          <button
            onClick={copyOrderId}
            className="inline-flex max-w-[70%] items-start gap-1.5 rounded-2xl border border-gray-200/80 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.08]"
          >
            <span className="leading-relaxed">
              Ref <span className="font-mono normal-case tracking-normal break-all">{transaction.orderId}</span>
            </span>
            {copiedRef ? <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-green-500" /> : <Copy size={11} className="mt-0.5 shrink-0" />}
          </button>
        </div>
      </div>

      <div className="px-6 py-5 sm:px-7 sm:py-6">
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span className="break-words leading-relaxed">{error}</span>
          </div>
        )}

        <div className="grid gap-3.5 md:grid-cols-[1.05fr_0.95fr] md:gap-4">
          <section className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm md:p-[18px] dark:border-white/10 dark:from-white/[0.06] dark:to-white/[0.02]">
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">Pay from this device</p>
                <h3 className="mt-2 text-base font-bold tracking-tight text-gray-950 dark:text-white">
                  Confirm securely in your wallet
                </h3>
              </div>
              <div className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                connected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-gray-200 bg-white text-gray-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-400"
              }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-500"}`} />
                {connected ? "Ready" : "Wallet needed"}
              </div>
            </div>

            <div className="relative mt-4 rounded-xl border border-gray-200/80 bg-white/80 p-3 dark:border-white/10 dark:bg-black/10">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Payment amount</span>
                <span className="text-sm font-bold text-gray-950 dark:text-white">{transaction.amount} SOL</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Supported wallets</span>
                <span className="text-right text-xs font-bold text-gray-700 dark:text-gray-200">Phantom, Solflare</span>
              </div>
            </div>

            <p className="relative mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Connect a supported Solana wallet, review the on-chain transaction, then approve it from this browser.
            </p>

            <button
              onClick={handlePayment}
              disabled={loading}
              className={`relative mt-4 inline-flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.99] ${
                connected
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:opacity-90"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Confirming in Wallet...</span>
                </>
              ) : (
                <>
                  <Wallet size={18} className={connected ? "" : "text-white/80"} />
                  <span>{connected ? "Pay with Wallet" : "Connect Wallet"}</span>
                  <ArrowRight size={16} className="opacity-60 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="relative mt-3 text-[10px] font-medium leading-relaxed text-gray-400 dark:text-gray-500">
              By proceeding, you authorize an on-chain Solana transaction for this checkout session.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-200/80 bg-gray-50/70 p-4 md:p-[18px] dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              <QrCode className="h-3.5 w-3.5" />
              Continue on mobile
            </div>

            <div className="mx-auto w-fit rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Checkout QR code"
                  width={232}
                  height={232}
                  className="h-[208px] w-[208px] sm:h-[224px] sm:w-[224px] rounded-sm"
                />
              ) : (
                <div className="h-[208px] w-[208px] sm:h-[224px] sm:w-[224px] animate-pulse rounded-sm bg-gray-100" />
              )}
            </div>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
              Scan to open this checkout on mobile. You will still review and approve the transaction in your wallet.
            </p>

            <div className="mt-3 grid gap-2">
              <a
                href={phantomBrowseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <Smartphone size={14} />
                Open in Phantom
                <ExternalLink size={12} className="opacity-60" />
              </a>

              <button
                onClick={copyCheckoutUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.06]"
              >
                {copiedCheckoutUrl ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                {copiedCheckoutUrl ? "Checkout URL copied" : "Copy checkout URL"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
