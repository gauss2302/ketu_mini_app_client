/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { telegramSDK } from "@/app/services/telegram-sdk.service";
import { apiClient } from "@/app/services/api-client.service";

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
        await telegramSDK.initialize();
        const rawData = telegramSDK.getInitDataRaw();
        if (!rawData) {
          throw new Error("Failed to retrieve initData");
        }

        setInitDataRaw(rawData);
        setInitData(parseInitData(rawData));
        setWebApp((window as any).Telegram?.WebApp || null);

        const authResponse = await apiClient.validateAuth();
        if (authResponse.valid && authResponse.user) {
          setUser(authResponse.user);
          // Tokens are stored in apiClient and localStorage
        }

        (window as any).Telegram?.WebApp?.ready();
        setIsReady(true);

        console.log("TelegramProvider initialized", {
          initDataRaw: rawData,
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
  }, []);

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
