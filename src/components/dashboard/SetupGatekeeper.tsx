// src/components/dashboard/SetupGatekeeper.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Mail, Lock, Building2, ArrowRight, Loader2 } from "lucide-react";
import { useGatekeeper } from "@/hooks/auth/useGatekeeper";

interface SetupGatekeeperProps {
  businessId: string;
  currentEmail: string;
  isWalletUser: boolean;
}

export default function SetupGatekeeper({ businessId, currentEmail, isWalletUser }: SetupGatekeeperProps) {
  const { isLoading, statusMsg, completeProfile, resendVerification } = useGatekeeper(businessId, currentEmail);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeProfile({ email, password, confirmPassword, businessName });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#2A2A2A] p-8 rounded-2xl shadow-xl"
      >
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
        </div>

        <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2">
          Action Required
        </h2>

        {/* KONDISI 1: User Login via Wallet */}
        {isWalletUser && (
          <>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
              To secure your account and prevent duplication, please link an email address and set a recovery password.
            </p>

            {statusMsg.text && (
              <div className={`mb-6 p-3 text-sm rounded-xl text-center font-medium border ${statusMsg.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}>
                {statusMsg.text}
              </div>
            )}

            {statusMsg.type !== "success" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Business Name" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" placeholder="Real Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" placeholder="Create Password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" placeholder="Confirm Password" required minLength={12} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save & Verify <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </>
        )}

        {/* KONDISI 2: User Login via Email tapi belum terverifikasi */}
        {!isWalletUser && (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Your email <strong className="text-gray-900 dark:text-white">({currentEmail})</strong> has not been verified yet. Check your inbox to activate your account.
            </p>
            
            {statusMsg.text && (
              <div className={`mb-6 p-3 text-sm rounded-xl text-center font-medium border ${statusMsg.type === "error" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"}`}>
                {statusMsg.text}
              </div>
            )}

            <button onClick={resendVerification} disabled={isLoading} className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-95 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Resend Verification Email"}
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
