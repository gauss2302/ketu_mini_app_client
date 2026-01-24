"use client";

import { hapticFeedback } from "@telegram-apps/sdk-react";
import { useCallback } from "react";

export const useHapticFeedback = () => {
  const impact = useCallback(
    (style: "light" | "medium" | "heavy" | "rigid" | "soft") => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Telegram?.WebApp) {
        hapticFeedback.impactOccurred(style);
      }
    },
    []
  );

  const notification = useCallback((type: "error" | "success" | "warning") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Telegram?.WebApp) {
      hapticFeedback.notificationOccurred(type);
    }
  }, []);

  const selection = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Telegram?.WebApp) {
      hapticFeedback.selectionChanged();
    }
  }, []);

  return { impact, notification, selection };
};
