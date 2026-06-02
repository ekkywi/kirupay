// src/components/ThemeProvider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
};

const STORAGE_KEY = "trezalink-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_VALUES: Theme[] = ["light", "dark", "system"];

let hasWarnedStorageRead = false;
let hasWarnedStorageWrite = false;

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme, enableSystem: boolean): ResolvedTheme {
  if (theme === "system" && enableSystem) return getSystemTheme();
  return theme === "light" ? "light" : "dark";
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function isTheme(value: string): value is Theme {
  return THEME_VALUES.includes(value as Theme);
}

function safeReadTheme(): Theme | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw || !isTheme(raw)) return null;
    return raw;
  } catch {
    if (process.env.NODE_ENV !== "production" && !hasWarnedStorageRead) {
      hasWarnedStorageRead = true;
      console.warn("ThemeProvider: localStorage read blocked by browser policy. Falling back to default theme.");
    }
    return null;
  }
}

function safeWriteTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    if (process.env.NODE_ENV !== "production" && !hasWarnedStorageWrite) {
      hasWarnedStorageWrite = true;
      console.warn("ThemeProvider: localStorage write blocked by browser policy. Theme persistence disabled.");
    }
  }
}

export function ThemeProvider({ children, defaultTheme = "dark", enableSystem = true }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(defaultTheme === "light" ? "light" : "dark");

  useEffect(() => {
    const storedTheme = safeReadTheme();
    const initialTheme = storedTheme || defaultTheme;
    const initialResolvedTheme = resolveTheme(initialTheme, enableSystem);
    const frame = requestAnimationFrame(() => {
      setThemeState(initialTheme);
      setResolvedTheme(initialResolvedTheme);
      applyTheme(initialResolvedTheme);
    });

    return () => cancelAnimationFrame(frame);
  }, [defaultTheme, enableSystem]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      if (theme !== "system" || !enableSystem) return;

      const nextResolvedTheme = getSystemTheme();
      applyTheme(nextResolvedTheme);
      setResolvedTheme(nextResolvedTheme);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [enableSystem, theme]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      const nextResolvedTheme = resolveTheme(nextTheme, enableSystem);
      safeWriteTheme(nextTheme);
      setThemeState(nextTheme);
      setResolvedTheme(nextResolvedTheme);
      applyTheme(nextResolvedTheme);
    },
    [enableSystem],
  );

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
