"use client";

import { useTelegram as useTelegramContext } from "@/app/components/providers/telegram-provider";

interface UseTelegramReturn {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  initDataRaw: string | undefined;
}

export const useTelegram = (): UseTelegramReturn => {
  const { isReady, error, initDataRaw } = useTelegramContext();

  return {
    isReady,
    isLoading: !isReady && !error,
    error: error ? new Error(error) : null,
    initDataRaw: initDataRaw ?? undefined,
  };
};
