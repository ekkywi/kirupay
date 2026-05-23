"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { throwApiResponseError } from "@/lib/client-api-error";

type InviteData = {
  email: string;
  role: "SUPERADMIN" | "SUPPORT" | "DEVELOPER";
  expiresAt: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function InternalRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setErrorMsg("Invite token is missing. Please use the registration link from your invite email.");
        setIsValidating(false);
        return;
      }

      try {
        setErrorMsg("");
        const res = await fetch("/api/internal-auth/invite/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          await throwApiResponseError(res, "Invalid invite token.");
        }

        const data = (await res.json()) as { invite: InviteData };
        setInvite(data.invite);
      } catch (error) {
        setErrorMsg(getErrorMessage(error));
      } finally {
        setIsValidating(false);
      }
    }

    void validateToken();
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invite) {
      setErrorMsg("Invite token is not valid.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/internal-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });

      if (!res.ok) {
        await throwApiResponseError(res, "Failed to complete internal registration.");
      }

      setSuccessMsg("Account created successfully. Redirecting to internal login...");
      setTimeout(() => router.push("/internal/login"), 900);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-root min-h-screen relative overflow-hidden selection:bg-red-500/20">
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#030712]" />
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-slate-50 to-slate-100 dark:from-red-950/20 dark:via-[#030712] dark:to-[#030712]" />
      <div className="landing-grid absolute inset-0 opacity-35 dark:opacity-20" />

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold landing-heading">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-600 dark:bg-red-500" />
              Trezalink Internal
            </Link>
          </div>

          <div className="landing-panel rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <span className="landing-label">Invite-Only Registration</span>
              <h1 className="mt-3 text-3xl font-bold landing-heading">Create Internal Account</h1>
              <p className="mt-2 text-sm landing-body">
                Complete your invite to access the internal admin console.
              </p>
            </div>

            {isValidating && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border landing-border bg-slate-50 p-3 text-sm landing-body dark:bg-white/[0.03]">
                <Loader2 className="w-4 h-4 animate-spin" /> Validating invite token...
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                {successMsg}
              </div>
            )}

            {invite && !successMsg && (
              <>
                <div className="mb-5 rounded-xl border landing-border bg-slate-50/70 p-4 text-xs landing-muted dark:bg-white/[0.03] space-y-1">
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {invite.email}</p>
                  <p className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Role: {invite.role}</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <label className="block">
                    <span className="text-xs font-semibold landing-muted">Full name</span>
                    <span className="relative mt-2 block">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 landing-subtle" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your full name"
                        className="w-full rounded-xl border landing-border bg-slate-50 px-4 py-3.5 pl-12 text-sm text-slate-900 outline-none transition-colors focus:border-red-500 focus:bg-white dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold landing-muted">Password</span>
                    <span className="relative mt-2 block">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 landing-subtle" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimum 12 chars with mixed complexity"
                        className="w-full rounded-xl border landing-border bg-slate-50 px-4 py-3.5 pl-12 text-sm text-slate-900 outline-none transition-colors focus:border-red-500 focus:bg-white dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                      />
                    </span>
                  </label>

                  <button type="submit" disabled={isSubmitting} className="landing-btn-primary w-full py-3.5 disabled:opacity-60">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    {isSubmitting ? "Creating account..." : "Complete registration"}
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 text-center text-xs landing-muted">
              Already registered? <Link href="/internal/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">Sign in here</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
