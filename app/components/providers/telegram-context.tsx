"use client";

import { createContext, useContext } from "react";
import type { TelegramWebApp } from "@/app/types/telegram";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  initDataRaw: string | null;
  initData: Record<string, unknown> | null;
  tokens: { accessToken: string; refreshToken: string } | null;
  error: string | null;
  isReady: boolean;
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
