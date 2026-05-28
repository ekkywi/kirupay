"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

type NavGroup = {
  label: string;
  links: Array<{ href: string; label: string }>;
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/use-cases", label: "Use Cases" },
      { href: "/security", label: "Security" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    label: "Developers",
    links: [
      { href: "/docs", label: "Docs" },
      { href: "/developer", label: "API" },
      { href: "/architecture", label: "Architecture" },
    ],
  },
  {
    label: "Trust",
    links: [
      { href: "/trust", label: "Trust Center" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/roadmap", label: "Roadmap" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
];

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <>
      <nav className="landing-nav relative z-50 mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border px-3 py-2.5 sm:px-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-full px-2 py-1.5 text-base font-black tracking-tight text-slate-950 transition-opacity hover:opacity-85 dark:text-white"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-white shadow-sm shadow-slate-950/20 dark:bg-white dark:text-slate-950">
            <span className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_32%_28%,#67e8f9,transparent_34%),linear-gradient(135deg,#34d399,#059669)] opacity-95" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-white dark:bg-slate-950" />
          </span>
          Trezalink
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="group relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
              >
                {group.label}
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full pt-3 opacity-0 translate-y-1 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="w-56 rounded-[1.35rem] border border-white/70 bg-white/88 p-2.5 shadow-xl shadow-slate-900/10 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/88 dark:shadow-black/35">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-2xl px-3.5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-emerald-300/10 dark:hover:text-emerald-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-colors hover:bg-white/70 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          <Link
            href="/login"
            className="hidden items-center rounded-full border border-slate-300/80 bg-white/58 px-4 py-2.5 text-sm font-black text-slate-800 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white dark:border-white/15 dark:bg-white/[0.045] dark:text-white dark:hover:border-emerald-300/30 dark:hover:bg-white/10 md:inline-flex"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="group hidden items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:bg-emerald-300 dark:text-slate-950 dark:hover:bg-emerald-200 md:inline-flex"
          >
            Create Merchant Account
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-950 md:hidden dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-x-4 top-[5.5rem] z-50 rounded-[1.7rem] border border-white/70 bg-white/92 p-4 shadow-2xl shadow-slate-900/12 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92 dark:shadow-black/40 md:hidden">
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-4 border-b border-slate-200/70 pb-4 last:mb-0 last:border-b-0 last:pb-0 dark:border-white/10">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-300/10 dark:hover:text-emerald-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-full border border-slate-200/80 px-4 py-3 text-center text-sm font-black text-slate-800 transition-colors hover:border-emerald-300 hover:bg-white dark:border-white/10 dark:text-white dark:hover:bg-white/[0.07]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="landing-btn-primary w-full py-3"
              >
                Create Merchant Account
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
