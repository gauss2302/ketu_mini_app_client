"use client";

import { useEffect } from "react";
import { useTelegram } from "./telegram-provider";

/**
 * Component that applies dark mode class to html element based on Telegram theme
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, webApp } = useTelegram();

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const html = document.documentElement;
    
    // Use theme from context if available, otherwise fallback to webApp.colorScheme
    const isDark = theme?.isDark ?? webApp?.colorScheme === "dark";
    
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme?.isDark, webApp?.colorScheme]);

  return <>{children}</>;
}
