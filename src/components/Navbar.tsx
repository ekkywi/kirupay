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
      <nav className="landing-nav relative z-50 flex items-center justify-between px-4 sm:px-5 py-3 max-w-7xl w-full mx-auto rounded-2xl border border-white/65 dark:border-white/12 bg-white/78 dark:bg-slate-950/72 backdrop-blur-2xl shadow-md shadow-slate-300/30 dark:shadow-black/30">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 dark:bg-cyan-400" />
          Trezalink
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-white/8 transition-colors"
              >
                {group.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 absolute left-0 top-full pt-2 transition-all">
                <div className="w-52 rounded-xl border landing-border bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-2 shadow-lg shadow-slate-200/50 dark:shadow-black/30">
                  {group.links.map((link) => (
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
          ))}
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
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-blue-700 transition-colors group"
          >
            Create Merchant Account
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex md:hidden items-center justify-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden fixed inset-x-4 top-[5.5rem] z-50 rounded-2xl border landing-border bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-4 shadow-xl shadow-slate-300/20 dark:shadow-black/40">
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="pb-4 mb-4 border-b last:border-b-0 last:mb-0 last:pb-0 landing-border">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/6 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center rounded-lg border landing-border px-3.5 py-2 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/8 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-blue-700 transition-colors"
              >
                Create Merchant Account
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
