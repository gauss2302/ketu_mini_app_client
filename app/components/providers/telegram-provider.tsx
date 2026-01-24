/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiClient } from "@/app/services/api-client.service";
import { useRawInitData } from "@telegram-apps/sdk-react";

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
  webApp: any | null; // Replace with WebApp type from @telegram-apps/sdk if available
  user: TelegramUser | null;
  initDataRaw: string | null;
  initData: Record<string, any> | null;
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

function parseInitData(initDataRaw: string): Record<string, any> | null {
  try {
    const trimmed = initDataRaw.trim();
    if (trimmed.startsWith("{")) {
      return JSON.parse(trimmed) as Record<string, any>;
    }

    const params = new URLSearchParams(initDataRaw);
    const decoded: Record<string, any> = {};
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

export function TelegramProvider({ children }: { children: any }) {
  const sdkRawInitData = useRawInitData();
  const [webApp, setWebApp] = useState<any | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);
  const [initData, setInitData] = useState<Record<string, any> | null>(null);
  // const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Prefer WebApp initData when available, fallback to SDK hook.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resolvedInitData =
          (typeof window !== "undefined" &&
            (window as any).Telegram?.WebApp?.initData) ||
          sdkRawInitData;

        if (!resolvedInitData) {
          if (typeof window !== "undefined" && !(window as any).Telegram?.WebApp) {
            setError("Not running in Telegram Web App environment");
            setIsReady(false);
          }
          return;
        }

        apiClient.setInitDataRaw(resolvedInitData);
        setInitDataRaw(resolvedInitData);
        setInitData(parseInitData(resolvedInitData));
        setWebApp((window as any).Telegram?.WebApp || null);

        const authResponse = await apiClient.validateAuth(resolvedInitData);
        if (authResponse.valid && authResponse.user) {
          setUser(authResponse.user);
        }

        (window as any).Telegram?.WebApp?.ready();
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
