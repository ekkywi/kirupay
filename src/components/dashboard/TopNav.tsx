"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Activity, LogOut, Search, Settings, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface TopNavProps {
  merchant: {
    businessName?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export function TopNav({ merchant }: TopNavProps) {
  const isAdmin = merchant?.role === "ADMIN";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [transactionSearch, setTransactionSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTransactionSearch = pathname === "/payments" ? searchParams.get("search") || "" : "";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setTransactionSearch(currentTransactionSearch));
    return () => cancelAnimationFrame(frame);
  }, [currentTransactionSearch]);

  const handleTransactionSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const search = transactionSearch.trim();
    const params = new URLSearchParams(pathname === "/payments" ? searchParams : undefined);

    params.delete("page");

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    const query = params.toString();
    router.push(query ? `/payments?${query}` : "/payments");
  };

  return (
    <header className="h-16 bg-white/95 dark:bg-[#0B0F17]/95 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 min-w-0">
        <div className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
          T
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
            {merchant?.businessName || (isAdmin ? "Admin console" : "Merchant dashboard")}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">Network</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Solana operational
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleTransactionSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={transactionSearch}
            onChange={(event) => setTransactionSearch(event.target.value)}
            placeholder="Search transactions..."
            className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]"
          />
        </form>
        
        <ThemeToggle />
        
        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20"
            aria-label="Open account menu"
          >
            <User size={16} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0B0F17] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 py-2 animate-in fade-in zoom-in duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{isAdmin ? "Admin account" : "Merchant account"}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white truncate">
                  {merchant?.email || "merchant@trezalink.com"}
                </p>
              </div>
              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.04]"
              >
                <Settings size={14} /> Settings
              </Link>
              <div className="mx-4 my-1 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
                <Activity size={14} className="text-emerald-500" />
                {isAdmin ? "Live admin environment" : "Live merchant environment"}
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
