"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

// Pastikan menggunakan NAMED EXPORT (tanpa kata 'default')
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Mencegah hydration mismatch error pada Next.js
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const baseClassName =
    "relative h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06]";

  if (!mounted) {
    return <div className={baseClassName} aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={baseClassName}
      title="Toggle theme"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
