"use client";

import { createContext, useContext } from "react";
import type { User, InitData, TelegramWebAppRaw } from "@/app/types/telegram";

/**
 * Context type for Telegram Mini App state
 * Uses User and InitData types from our types file
 */
export interface TelegramContextType {
  /** Raw WebApp object from window.Telegram.WebApp */
  webApp: TelegramWebAppRaw | null;
  /** User data (camelCase format) */
  user: User | null;
  /** Raw initData string for backend authentication */
  initDataRaw: string | null;
  /** Parsed InitData object */
  initData: InitData | Record<string, unknown> | null;
  /** JWT tokens from backend */
  tokens: { accessToken: string; refreshToken: string } | null;
  /** Error message if any */
  error: string | null;
  /** Whether the app is ready */
  isReady: boolean;
  /** Debug info for troubleshooting */
  debugInfo?: {
    initDataLength?: number;
    authStatus?: string;
    sdkVersion?: string;
  };
}

export const defaultTelegramContext: TelegramContextType = {
  webApp: null,
  user: null,
  initDataRaw: null,
  initData: null,
  tokens: null,
  error: null,
  isReady: false,
};

export const TelegramContext =
  createContext<TelegramContextType>(defaultTelegramContext);

export function useTelegram(): TelegramContextType {
  const value = useContext(TelegramContext);
  if (value == null) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return value;
}

// Re-export User type for convenience
export type { User, InitData };
