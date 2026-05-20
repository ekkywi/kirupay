// src/app/activate/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

// Komponen Utama yang memproses logika
function ActivationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const hasToken = Boolean(token);

  const [status, setStatus] = useState<"loading" | "success" | "error">(hasToken ? "loading" : "error");
  const [message, setMessage] = useState(
    hasToken ? "Authenticating your token..." : "Invalid activation link. No token provided."
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    const activateAccount = async () => {
      try {
        const res = await fetch("/api/auth/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to activate account.");
        }

        setStatus("success");
        setMessage("Your account is verified and ready to use.");
        
        // Opsional: Redirect ke halaman login secara otomatis
        setTimeout(() => {
          router.push("/login");
        }, 3000);

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to activate account.";
        setStatus("error");
        setMessage(errorMessage);
      }
    };

    // Sengaja diberi delay 500ms agar user melihat animasi loading (UX lebih baik)
    const timeoutId = setTimeout(activateAccount, 500);
    return () => clearTimeout(timeoutId);

  }, [token, router]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
    >
      <div className="flex justify-center mb-6">
        {status === "loading" && (
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
        {status === "success" && (
          <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        )}
        {status === "error" && (
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        )}
      </div>

      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
        {status === "loading" ? "Verifying Account" : status === "success" ? "Verification Complete!" : "Verification Failed"}
      </h1>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        {message}
      </p>

      {status === "success" ? (
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Redirecting to login...
        </p>
      ) : (
        <Link 
          href="/login"
          className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black font-black py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
        >
          Return to Login <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  );
}

// Wrapper halaman (Wajib untuk Next.js App Router jika menggunakan useSearchParams)
export default function ActivatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] dark:bg-[#030305] p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Gateway</p>
        </div>
      }>
        <ActivationContent />
      </Suspense>
    </div>
  );
}
