"use client";

import { useEffect, useRef } from "react";
import { apiClient } from "@/app/services/api-client.service";
import { useRawInitData } from "@telegram-apps/sdk-react";
import type { TelegramWebApp } from "@/app/types/telegram";
import { initTelegramSDK } from "@/app/utils/telegram-sdk-init";
import type { TelegramContextType, TelegramUser } from "./telegram-context";

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

/** Client-only. Runs SDK init + auth, updates parent context. Rendered via dynamic import (ssr: false). */
export function TelegramBootstrap({
  onUpdate,
}: {
  onUpdate: (ctx: Partial<TelegramContextType>) => void;
}) {
  // useRawInitData hook from @telegram-apps/sdk-react - returns raw initData string
  const sdkRawInitData = useRawInitData();
  const hasInitializedRef = useRef(false);
  const hasAuthenticatedRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      // Prevent multiple authentication attempts
      if (hasAuthenticatedRef.current) {
        return;
      }

      try {
        const telegramWebApp =
          typeof window !== "undefined"
            ? (window as TelegramWindow).Telegram?.WebApp
            : null;

        // Initialize SDK if not already done
        if (telegramWebApp && !hasInitializedRef.current) {
          await initTelegramSDK();
          hasInitializedRef.current = true;
        }

        // Prefer SDK's useRawInitData() hook result, fallback to window.Telegram.WebApp.initData
        // useRawInitData() returns the raw initData string in the format expected by backend
        const resolvedInitData = sdkRawInitData || telegramWebApp?.initData;

        if (!resolvedInitData) {
          if (!telegramWebApp) {
            onUpdate({
              error: "Not running in Telegram Web App environment",
              isReady: false,
            });
          } else {
            // SDK initialized but no initData yet - wait for it
            console.log("Waiting for initData...");
          }
          return;
        }

        // Set initData in API client
        apiClient.setInitDataRaw(resolvedInitData);
        
        // Authenticate with backend
        const authResponse = await apiClient.validateAuth(resolvedInitData);

        if (authResponse.valid && authResponse.user) {
          hasAuthenticatedRef.current = true;
          onUpdate({
            webApp: telegramWebApp || null,
            user: authResponse.user as TelegramUser,
            initDataRaw: resolvedInitData,
            initData: parseInitData(resolvedInitData),
            tokens: {
              accessToken: apiClient.getAccessToken() || "",
              refreshToken: localStorage.getItem("refreshToken") || "",
            },
            error: null,
            isReady: true,
          });
        } else {
          onUpdate({
            webApp: telegramWebApp || null,
            initDataRaw: resolvedInitData,
            initData: parseInitData(resolvedInitData),
            error: authResponse.valid ? null : "Authentication failed",
            isReady: true,
          });
        }

        // Notify Telegram that the app is ready
        telegramWebApp?.ready();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Initialization failed";
        console.error("TelegramBootstrap error:", err);
        onUpdate({ error: msg, isReady: false });
      }
    };

    run();
  }, [sdkRawInitData, onUpdate]);

  return null;
}
