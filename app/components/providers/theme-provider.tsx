"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTelegram } from "./telegram-context";

export type ThemeMode = "telegram" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "ketu-theme-mode";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "telegram" || value === "light" || value === "dark";
}

function getResolvedTheme(mode: ThemeMode, telegramTheme: ResolvedTheme): ResolvedTheme {
  if (mode === "telegram") {
    return telegramTheme;
  }

  return mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, webApp } = useTelegram();
  const telegramTheme: ResolvedTheme =
    (theme?.isDark ?? (webApp?.colorScheme === "dark")) ? "dark" : "light";

  const [themeMode, setThemeMode] = useState<ThemeMode>("telegram");
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  const resolvedTheme = getResolvedTheme(themeMode, telegramTheme);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedThemeMode = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(storedThemeMode)) {
      setThemeMode(storedThemeMode);
    }

    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const html = document.documentElement;
    html.classList.toggle("dark", resolvedTheme === "dark");
    html.classList.toggle("light", resolvedTheme === "light");
    html.dataset.theme = resolvedTheme;
    html.dataset.themeMode = themeMode;
    html.style.colorScheme = resolvedTheme;

    const backgroundColor = resolvedTheme === "dark" ? "#0e141b" : "#f7efe5";
    const headerColor = resolvedTheme === "dark" ? "#151d24" : "#fffaf4";

    try {
      webApp?.setBackgroundColor?.(backgroundColor);
      webApp?.setHeaderColor?.(headerColor);
    } catch {
      // These methods are not guaranteed across all Telegram clients.
    }
  }, [resolvedTheme, themeMode, webApp]);

  useEffect(() => {
    if (!hasLoadedPreference || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [hasLoadedPreference, themeMode]);

  const value: ThemeContextValue = {
    themeMode,
    resolvedTheme,
    setThemeMode,
    toggleTheme: () => {
      setThemeMode((currentMode) => {
        const currentResolvedTheme = getResolvedTheme(currentMode, telegramTheme);
        return currentResolvedTheme === "dark" ? "light" : "dark";
      });
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return value;
}
