"use client";

import { hapticFeedback } from "@telegram-apps/sdk-react";
import { useCallback } from "react";
import type { TelegramWebApp } from "@/app/types/telegram";

type TelegramWindow = Window & { Telegram?: { WebApp?: TelegramWebApp } };

export const useHapticFeedback = () => {
  const impact = useCallback(
    (style: "light" | "medium" | "heavy" | "rigid" | "soft") => {
      const telegramWebApp =
        typeof window !== "undefined"
          ? (window as TelegramWindow).Telegram?.WebApp
          : null;
      if (telegramWebApp) {
        hapticFeedback.impactOccurred(style);
      }
    },
    []
  );

  const notification = useCallback((type: "error" | "success" | "warning") => {
    const telegramWebApp =
      typeof window !== "undefined"
        ? (window as TelegramWindow).Telegram?.WebApp
        : null;
    if (telegramWebApp) {
      hapticFeedback.notificationOccurred(type);
    }
  }, []);

  const selection = useCallback(() => {
    const telegramWebApp =
      typeof window !== "undefined"
        ? (window as TelegramWindow).Telegram?.WebApp
        : null;
    if (telegramWebApp) {
      hapticFeedback.selectionChanged();
    }
  }, []);

  return { impact, notification, selection };
};
