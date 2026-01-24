"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiClient } from "@/app/services/api-client.service";
import { init, useRawInitData } from "@telegram-apps/sdk-react";
import type { TelegramWebApp } from "@/app/types/telegram";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  initDataRaw: string | null;
  initData: Record<string, unknown> | null;
  tokens: AuthTokens | null;
  error: string | null;
  isReady: boolean;
}

const defaultContext: TelegramContextType = {
  webApp: null,
  user: null,
  initDataRaw: null,
  initData: null,
  tokens: null,
  error: null,
  isReady: false,
};

const TelegramContext = createContext<TelegramContextType>(defaultContext);

type TelegramWindow = Window & { Telegram?: { WebApp?: TelegramWebApp } };

function parseInitData(initDataRaw: string): Record<string, unknown> | null {
  try {
    const trimmed = initDataRaw.trim();
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed) as Record<string, unknown>;
    }

    const params = new URLSearchParams(initDataRaw);
    const decoded: Record<string, unknown> = {};
    for (const [key, value] of params.entries()) {
      try {
        decoded[key] = JSON.parse(value);
      } catch {
        decoded[key] = value;
      }
    }
    return decoded;
  } catch (err) {
    console.error("Error parsing init data:", err);
    return null;
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const sdkRawInitData = useRawInitData();
  const hasInitializedRef = useRef(false);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);
  const [initData, setInitData] = useState<Record<string, unknown> | null>(null);
  // const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const telegramWebApp =
          typeof window !== "undefined"
            ? (window as TelegramWindow).Telegram?.WebApp
            : null;

        if (telegramWebApp && !hasInitializedRef.current) {
          init();
          hasInitializedRef.current = true;
        }

        // Prefer WebApp initData when available, fallback to SDK hook.
        const resolvedInitData = telegramWebApp?.initData || sdkRawInitData;

        if (!resolvedInitData) {
          if (!telegramWebApp) {
            setError("Not running in Telegram Web App environment");
            setIsReady(false);
          }
          return;
        }

        apiClient.setInitDataRaw(resolvedInitData);
        setInitDataRaw(resolvedInitData);
        setInitData(parseInitData(resolvedInitData));
        setWebApp(telegramWebApp || null);

        const authResponse = await apiClient.validateAuth(resolvedInitData);
        if (authResponse.valid && authResponse.user) {
          setUser(authResponse.user);
        }

        telegramWebApp?.ready();
        setIsReady(true);
        setError(null);

        console.log("TelegramProvider initialized", {
          initDataRaw: resolvedInitData,
          user: authResponse.user,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Initialization failed";
        console.error("TelegramProvider error:", err);
        setError(errorMessage);
        setIsReady(false);
      }
    };

    initialize();
  }, [sdkRawInitData]);

  const value: TelegramContextType = {
    webApp,
    user,
    initDataRaw,
    initData,
    tokens: null, // TODO: Expose tokens if needed
    error,
    isReady,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextType {
  const content = useContext(TelegramContext);
  if (content == undefined) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }

  return content;
}
