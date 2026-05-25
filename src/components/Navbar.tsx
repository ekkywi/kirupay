"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

const PRODUCT_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/status", label: "Status" },
  { href: "/faq", label: "FAQ" },
];

const RESOURCE_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/developer", label: "API" },
  { href: "/architecture", label: "Architecture" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <nav className="landing-nav relative z-50 flex items-center justify-between px-4 sm:px-5 py-3 max-w-7xl w-full mx-auto rounded-2xl border border-white/65 dark:border-white/12 bg-white/78 dark:bg-slate-950/72 backdrop-blur-2xl shadow-md shadow-slate-300/30 dark:shadow-black/30">
      <Link
        href="/"
        className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-85 transition-opacity"
      >
        <span className="inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 dark:bg-cyan-400" />
        Trezalink
      </Link>

      <div className="hidden md:flex items-center gap-1">
        <div className="relative group">
          <button
            type="button"
            className="inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-white/8 transition-colors"
          >
            Product
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 absolute left-0 top-full pt-2 transition-all">
            <div className="w-44 rounded-xl border landing-border bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-2 shadow-lg shadow-slate-200/50 dark:shadow-black/30">
              {PRODUCT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="relative group">
          <button
            type="button"
            className="inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-white/8 transition-colors"
          >
            Resources
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 absolute left-0 top-full pt-2 transition-all">
            <div className="w-48 rounded-xl border landing-border bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-2 shadow-lg shadow-slate-200/50 dark:shadow-black/30">
              {RESOURCE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        <Link
          href="/login"
          className="hidden sm:inline-flex items-center rounded-lg border border-slate-300 dark:border-white/15 bg-white/70 dark:bg-white/5 text-slate-800 dark:text-white text-sm font-semibold px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          Sign in
        </Link>

        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-blue-700 transition-colors group"
        >
          Create Merchant Account
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </nav>
  );
}
