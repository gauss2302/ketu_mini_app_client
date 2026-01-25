"use client";

import { useEffect, useRef } from "react";
import { apiClient } from "@/app/services/api-client.service";
import { useRawInitData } from "@telegram-apps/sdk-react";
import { retrieveRawInitData } from "@telegram-apps/sdk";
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
  const initDataRef = useRef<string | null>(null);

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

        if (!telegramWebApp) {
          onUpdate({
            error: "Not running in Telegram Web App environment",
            isReady: false,
          });
          return;
        }

        // Initialize SDK if not already done
        if (!hasInitializedRef.current) {
          console.log("Initializing Telegram SDK...");
          await initTelegramSDK();
          hasInitializedRef.current = true;
          console.log("Telegram SDK initialized");
        }

        // Try multiple methods to get initData in order of preference:
        // 1. useRawInitData() hook (reactive, preferred method)
        // 2. retrieveRawInitData() directly from SDK (after init)
        // 3. window.Telegram.WebApp.initData (fallback)
        let resolvedInitData: string | null | undefined = sdkRawInitData || initDataRef.current;
        
        if (!resolvedInitData) {
          try {
            resolvedInitData = retrieveRawInitData();
            console.log("Got initData from retrieveRawInitData()");
          } catch (e) {
            console.warn("retrieveRawInitData() failed:", e);
          }
        } else if (sdkRawInitData) {
          console.log("Got initData from useRawInitData() hook");
        }

        if (!resolvedInitData) {
          resolvedInitData = telegramWebApp.initData;
          if (resolvedInitData) {
            console.log("Got initData from window.Telegram.WebApp.initData");
          }
        }

        if (!resolvedInitData) {
          console.warn("No initData available from any source. Waiting for initData...");
          // Store current hook value for next render
          if (sdkRawInitData) {
            initDataRef.current = sdkRawInitData;
          }
          // Don't set error yet - might be loading, hook might update
          return;
        }

        // Store for future use
        initDataRef.current = resolvedInitData;
        console.log("Retrieved initData, length:", resolvedInitData.length, "first 50 chars:", resolvedInitData.substring(0, 50));

        // Set initData in API client
        apiClient.setInitDataRaw(resolvedInitData);
        
        // Authenticate with backend
        console.log("Authenticating with backend...");
        const authResponse = await apiClient.validateAuth(resolvedInitData);

        if (authResponse.valid && authResponse.user) {
          console.log("Authentication successful for user:", authResponse.user.id);
          hasAuthenticatedRef.current = true;
          
          // Convert server response format to TelegramUser format for context
          const telegramUser: TelegramUser = {
            id: authResponse.user.id,
            first_name: authResponse.user.first_name,
            last_name: authResponse.user.last_name,
            username: authResponse.user.username,
            language_code: authResponse.user.language_code,
            is_premium: authResponse.user.is_premium,
          };
          
          onUpdate({
            webApp: telegramWebApp,
            user: telegramUser,
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
          console.error("Authentication failed:", authResponse);
          onUpdate({
            webApp: telegramWebApp,
            initDataRaw: resolvedInitData,
            initData: parseInitData(resolvedInitData),
            error: "Authentication failed. Please check backend connection.",
            isReady: true,
          });
        }

        // Notify Telegram that the app is ready
        telegramWebApp.ready();
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
