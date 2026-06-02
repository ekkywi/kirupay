"use client";

import { CheckCircle2, Copy, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ReceiptActionsProps = {
  orderId: string;
  txSignature: string | null;
};

type CopyTarget = "order" | "signature" | "receipt";
type CopyFeedback = "idle" | "success" | "error";

export function ReceiptActions({ orderId, txSignature }: ReceiptActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>("idle");
  const menuRef = useRef<HTMLDivElement | null>(null);

  const writeClipboard = async (target: CopyTarget, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback("success");
      window.setTimeout(() => setCopyFeedback("idle"), 1800);
    } catch {
      setCopyFeedback("error");
      window.setTimeout(() => setCopyFeedback("idle"), 2200);
    }
  };

  const receiptUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [menuOpen]);

  const handleCopyTarget = (target: CopyTarget) => {
    const value = target === "order" ? orderId : target === "signature" ? txSignature || "" : receiptUrl;
    const canCopy = target !== "signature" || Boolean(txSignature);
    setMenuOpen(false);
    if (!canCopy || !value) return;
    void writeClipboard(target, value);
  };

  const copyButtonLabel = copyFeedback === "success" ? "Copied" : copyFeedback === "error" ? "Copy failed" : "Copy";

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.06]"
        >
          {copyFeedback === "success" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="leading-none">{copyButtonLabel}</span>
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-full rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-[#161616]">
            <button
              onClick={() => handleCopyTarget("order")}
              className="flex h-9 w-full items-center rounded-lg px-2.5 text-left text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.08]"
            >
              Copy order ref
            </button>
            <button
              onClick={() => handleCopyTarget("signature")}
              disabled={!txSignature}
              className="flex h-9 w-full items-center rounded-lg px-2.5 text-left text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-white/[0.08]"
            >
              Copy tx signature
            </button>
            <button
              onClick={() => handleCopyTarget("receipt")}
              className="flex h-9 w-full items-center rounded-lg px-2.5 text-left text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.08]"
            >
              Copy receipt link
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => window.print()}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.06]"
      >
        <Printer className="h-3.5 w-3.5" />
        <span className="leading-none">Print or save</span>
      </button>
    </div>
  );
}
