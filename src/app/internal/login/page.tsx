"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { throwAuthResponseError } from "@/lib/auth-client-error";

const TEAM_POINTS = [
  "Invite-only internal access",
  "Role-based operator permissions",
  "Maintenance and incident controls",
  "Secure session with actor-scoped auth",
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function InternalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/internal-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        await throwAuthResponseError(response, "Could not sign you in right now.");
      }

      setSuccessMsg("You are in. Taking you to the admin console...");
      setTimeout(() => router.push("/admin/overview"), 700);
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-root relative min-h-screen overflow-hidden selection:bg-cyan-400/20">
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#030712]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.22),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.2),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.16),transparent_40%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.2),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.16),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.16),transparent_40%)]" />
      <div className="absolute inset-0 opacity-35 dark:opacity-25" style={{
        backgroundImage:
          "linear-gradient(rgba(51,65,85,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(51,65,85,0.12) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
        maskImage: "radial-gradient(ellipse 90% 65% at 50% 8%, black 10%, transparent 78%)",
      }} />

      <main className="relative z-10 min-h-screen grid lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r border-slate-200/80 dark:border-white/10">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
            Trezalink Internal
          </Link>

          <div className="max-w-xl animate-in fade-in slide-in-from-left-2 duration-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Team access
            </span>
            <h1 className="mt-5 text-5xl xl:text-6xl font-bold tracking-tight leading-[1.03] text-slate-950 dark:text-white">
              Welcome back, team.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Let&apos;s get you into the console. Keep operations moving, monitor system health, and handle recovery workflows without friction.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-3">
              {TEAM_POINTS.map((point, index) => (
                <div
                  key={point}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <p className="text-sm text-slate-700 dark:text-slate-200">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">Ops access is logged and invite-gated for security.</p>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="lg:hidden mb-9 flex justify-center">
              <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500" />
                Trezalink Internal
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-sm dark:border-white/10 dark:bg-[#0B0F17]/95 dark:shadow-black/30 sm:p-8">
              <div className="mb-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                  <Terminal className="h-3.5 w-3.5" />
                  Internal login
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Admin console access</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use your internal credentials to continue.</p>
              </div>

              {errorMsg && (
                <div className="mb-5 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-5 flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Internal email</span>
                  <span className="relative mt-2 block">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@trezalink.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 text-sm text-slate-900 outline-none transition-all focus:border-cyan-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)] dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Password</span>
                  <span className="relative mt-2 block">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-cyan-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)] dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  {isLoading ? "Signing you in..." : "Enter console"}
                  {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                Merchant account? Continue at{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                  merchant login
                </Link>
                .
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
