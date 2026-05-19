"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import bs58 from "bs58";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";

type AuthTab = "email" | "wallet";

type SolanaProvider = {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
};

type SolanaWindow = Window & {
  solana?: SolanaProvider;
};

const TRUST_POINTS = [
  "Non-custodial merchant settlement",
  "API keys and webhook signing",
  "Payment links and hosted checkout",
  "Dashboard analytics for every transaction",
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearStatus = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setIsLoading(true);
    clearStatus();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in.");
      }

      setSuccessMsg("Signed in successfully. Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setIsWalletLoading(true);
    clearStatus();

    try {
      const provider = (window as SolanaWindow).solana;
      if (!provider?.isPhantom) {
        throw new Error("Solana wallet not found. Please install Phantom Wallet.");
      }

      const { publicKey } = await provider.connect();
      const address = publicKey.toString();
      const message = `Authenticate with Trezalink\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await provider.signMessage(encodedMessage, "utf8");
      const signature = bs58.encode(signedMessage.signature);

      const response = await fetch("/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: address, signature, message }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Wallet authentication failed.");
      }

      setSuccessMsg("Wallet authenticated. Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setErrorMsg(message.includes("User rejected") ? "Authentication request was canceled." : message);
    } finally {
      setIsWalletLoading(false);
    }
  };

  return (
    <div className="landing-root min-h-screen relative overflow-hidden selection:bg-blue-500/20">
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#030712]" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 dark:from-blue-950/25 dark:via-[#030712] dark:to-[#030712]" />
      <div className="landing-grid absolute inset-0 opacity-35 dark:opacity-20" />

      <main className="relative z-10 min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r landing-border">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold landing-heading w-fit">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
            Trezalink
          </Link>

          <div className="max-w-xl">
            <span className="landing-label">Merchant access</span>
            <h1 className="mt-4 text-5xl xl:text-6xl font-bold tracking-tight leading-[1.05] landing-heading">
              Welcome back to your payment command center.
            </h1>
            <p className="mt-6 text-lg landing-body">
              Sign in to manage payment links, API credentials, webhook logs, analytics, and wallet-direct Solana settlement.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 gap-3">
              {TRUST_POINTS.map((point) => (
                <div key={point} className="landing-panel rounded-xl p-4 flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm landing-body">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs landing-subtle">Trezalink by Trezanix. Global payments, borderless economy.</p>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-10 flex justify-center">
              <Link href="/" className="flex items-center gap-2 text-lg font-bold landing-heading">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                Trezalink
              </Link>
            </div>

            <div className="landing-panel rounded-2xl p-6 sm:p-8">
              <div className="mb-8">
                <span className="landing-label">Sign in</span>
                <h2 className="mt-3 text-3xl font-bold landing-heading">Access dashboard</h2>
                <p className="mt-2 landing-body text-sm">Use your merchant email or verify wallet ownership.</p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 rounded-xl border landing-border bg-slate-100 dark:bg-white/[0.03] p-1.5 mb-6">
                {[
                  { key: "email" as const, label: "Email", icon: Mail },
                  { key: "wallet" as const, label: "Wallet", icon: Wallet },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                      clearStatus();
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      activeTab === tab.key
                        ? "bg-white text-blue-700 shadow-sm dark:bg-white/10 dark:text-white"
                        : "landing-muted hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  {successMsg}
                </div>
              )}

              {activeTab === "email" ? (
                <form className="space-y-5" onSubmit={handleLogin}>
                  <label className="block">
                    <span className="text-xs font-semibold landing-muted">Business email</span>
                    <span className="relative mt-2 block">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 landing-subtle" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="name@company.com"
                        className="w-full rounded-xl border landing-border bg-slate-50 px-4 py-3.5 pl-12 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold landing-muted">Password</span>
                    <span className="relative mt-2 block">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 landing-subtle" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border landing-border bg-slate-50 px-4 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 landing-muted hover:text-slate-900 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </span>
                  </label>

                  <button type="submit" disabled={isLoading} className="landing-btn-primary w-full py-3.5 disabled:opacity-60">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border landing-border bg-slate-50 p-6 text-center dark:bg-white/[0.03]">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/15">
                      <Fingerprint className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold landing-heading">Wallet authentication</h3>
                    <p className="mt-2 text-sm landing-body">Sign a one-time message to prove wallet ownership. No transaction is sent.</p>
                  </div>
                  <button type="button" onClick={handleWalletLogin} disabled={isWalletLoading} className="landing-btn-primary w-full py-3.5 disabled:opacity-60">
                    {isWalletLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                    {isWalletLoading ? "Waiting for wallet" : "Connect and sign"}
                  </button>
                </div>
              )}

              <div className="mt-8 border-t landing-border pt-6 text-center">
                <p className="text-sm landing-body">
                  New to Trezalink?{" "}
                  <Link href="/register" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    Create merchant account
                  </Link>
                </p>
                <div className="mt-5 flex items-center justify-center gap-4 text-xs landing-subtle">
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Non-custodial</span>
                  <span className="inline-flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> Secure access</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
