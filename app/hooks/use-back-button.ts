// hooks/use-back-button.ts
"use client";

import { useEffect, useCallback } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import type { TelegramWebApp } from "@/app/types/telegram";

type TelegramWindow = Window & { Telegram?: { WebApp?: TelegramWebApp } };

interface UseBackButtonOptions {
  onBack?: () => void;
  autoShow?: boolean;
}

/**
 * Hook for Telegram Back Button. Uses isAvailable() before mount/show/hide per SDK best practices.
 * @see https://habr.com/ru/companies/doubletapp/articles/917286/
 */
export const useBackButton = ({
  onBack,
  autoShow = true,
}: UseBackButtonOptions = {}) => {
  useEffect(() => {
    const telegramWebApp =
      typeof window !== "undefined"
        ? (window as TelegramWindow).Telegram?.WebApp
        : null;
    if (!telegramWebApp) return;

    try {
      if (
        backButton.mount.isAvailable() &&
        !backButton.isMounted()
      ) {
        backButton.mount();
      }
      if (autoShow && backButton.show.isAvailable()) {
        backButton.show();
      }
    } catch (error) {
      console.error("Failed to initialize back button:", error);
    }

    return () => {
      if (backButton.hide.isAvailable() && backButton.isMounted()) {
        backButton.hide();
      }
    };
  }, [autoShow]);

  useEffect(() => {
    if (!onBack) return;
    if (!backButton.onClick.isAvailable()) return;

    const handleBackClick = () => onBack();
    const unsubscribe = backButton.onClick(handleBackClick);
    return () => unsubscribe();
  }, [onBack]);

  const showBackButton = useCallback(() => {
    if (backButton.show.isAvailable() && backButton.isMounted()) {
      backButton.show();
    }
  }, []);

  const hideBackButton = useCallback(() => {
    if (backButton.hide.isAvailable() && backButton.isMounted()) {
      backButton.hide();
    }
  }, []);

  const isVisible = useCallback(
    () => backButton.isMounted() && backButton.isVisible(),
    []
  );

  return {
    show: showBackButton,
    hide: hideBackButton,
    isVisible,
  };
};
