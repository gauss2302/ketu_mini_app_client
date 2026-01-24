"use client";

import { useState, useEffect } from "react";
import { telegramSDK } from "@/app/services/telegram-sdk.service";

interface UseTelegramReturn {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  initDataRaw: string | undefined;
}

export const useTelegram = (): UseTelegramReturn => {
  const [isReady, setIsReady] = useState(telegramSDK.isReady());
  const [isLoading, setIsLoading] = useState(!telegramSDK.isReady());
  const [error, setError] = useState<Error | null>(telegramSDK.getError());
  const [initDataRaw, setInitDataRaw] = useState<string | undefined>(
    telegramSDK.getInitDataRaw()
  );

  useEffect(() => {
    console.log("useTelegram: Starting initialization");
    const initialize = async () => {
      try {
        await telegramSDK.initialize();
        setIsReady(telegramSDK.isReady());
        setInitDataRaw(telegramSDK.getInitDataRaw());
        setError(telegramSDK.getError());
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Unknown initialization error");
        console.error("useTelegram: Initialization failed:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!telegramSDK.isReady()) {
      initialize();
    } else {
      setIsReady(true);
      setInitDataRaw(telegramSDK.getInitDataRaw());
      setError(null);
      setIsLoading(false);
    }
  }, []);

  return {
    isReady,
    isLoading,
    error,
    initDataRaw,
  };
};
