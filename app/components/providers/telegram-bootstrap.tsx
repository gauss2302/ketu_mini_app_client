"use client";

import { useEffect, useRef } from "react";
import { apiClient } from "@/app/services/api-client.service";
import { useRawInitData } from "@telegram-apps/sdk-react";
import { retrieveRawInitData } from "@telegram-apps/sdk";
import type { TelegramWindow, InitData } from "@/app/types/telegram";
import { serverUserToUser } from "@/app/types/telegram";
import { initTelegramSDK } from "@/app/utils/telegram-sdk-init";
import type { TelegramContextType } from "./telegram-context";

/**
 * Validates initData format - should be a URL-encoded query string
 */
function validateInitDataFormat(initData: string): { valid: boolean; reason?: string } {
  if (!initData || initData.length === 0) {
    return { valid: false, reason: "initData is empty" };
  }

  // initData should be URL-encoded query string format
  // e.g., "query_id=AAH...&user=%7B%22id%22%3A...&auth_date=...&hash=..."
  if (!initData.includes("=") || !initData.includes("&")) {
    // Might be a short initData or invalid format
    if (initData.length < 50) {
      return { valid: false, reason: "initData too short, likely invalid" };
    }
  }

  // Check for required fields
  if (!initData.includes("hash=")) {
    return { valid: false, reason: "initData missing hash field" };
  }

  if (!initData.includes("auth_date=")) {
    return { valid: false, reason: "initData missing auth_date field" };
  }

  return { valid: true };
}

/**
 * Parse initData from URL-encoded query string format
 */
function parseInitDataRaw(initDataRaw: string): Record<string, unknown> | null {
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
    console.error("[TG Auth] Error parsing init data:", err);
    return null;
  }
}

/** Client-only. Runs SDK init + auth, updates parent context. Rendered via dynamic import (ssr: false). */
export function TelegramBootstrap({
  onUpdate,
}: {
  onUpdate: (ctx: Partial<TelegramContextType>) => void;
}) {
  // Official hook from @telegram-apps/sdk-react
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

      const debugInfo: TelegramContextType["debugInfo"] = {
        authStatus: "starting",
      };

      try {
        const telegramWebApp =
          typeof window !== "undefined"
            ? (window as TelegramWindow).Telegram?.WebApp
            : null;

        if (!telegramWebApp) {
          onUpdate({
            error: "Not running in Telegram Web App environment",
            isReady: false,
            debugInfo: { ...debugInfo, authStatus: "no_webapp" },
          });
          return;
        }

        debugInfo.sdkVersion = telegramWebApp.version;

        // Initialize SDK if not already done
        if (!hasInitializedRef.current) {
          console.log("[TG Auth] Initializing Telegram SDK...");
          try {
            await initTelegramSDK();
            hasInitializedRef.current = true;
            console.log("[TG Auth] SDK initialized successfully");
          } catch (initError) {
            console.error("[TG Auth] SDK init failed:", initError);
            // Continue anyway - we can still try to get initData from window
          }
        }

        // Try multiple methods to get initData in order of preference:
        // 1. useRawInitData() hook (reactive, preferred method from SDK)
        // 2. retrieveRawInitData() directly from SDK (after init)
        // 3. window.Telegram.WebApp.initData (fallback)
        let resolvedInitData: string | null | undefined = sdkRawInitData || initDataRef.current;
        let initDataSource = "cached";
        
        if (!resolvedInitData) {
          try {
            resolvedInitData = retrieveRawInitData();
            initDataSource = "retrieveRawInitData()";
            console.log("[TG Auth] Got initData from retrieveRawInitData()");
          } catch (e) {
            console.warn("[TG Auth] retrieveRawInitData() failed:", e);
          }
        } else if (sdkRawInitData) {
          initDataSource = "useRawInitData() hook";
          console.log("[TG Auth] Got initData from useRawInitData() hook");
        }

        if (!resolvedInitData) {
          resolvedInitData = telegramWebApp.initData;
          if (resolvedInitData) {
            initDataSource = "window.Telegram.WebApp.initData";
            console.log("[TG Auth] Got initData from window.Telegram.WebApp.initData");
          }
        }

        if (!resolvedInitData) {
          console.warn("[TG Auth] No initData available from any source");
          onUpdate({
            webApp: telegramWebApp,
            error: "No initData available. Make sure the app is opened from Telegram.",
            isReady: true,
            debugInfo: { ...debugInfo, authStatus: "no_init_data", initDataLength: 0 },
          });
          return;
        }

        // Validate initData format
        const validation = validateInitDataFormat(resolvedInitData);
        if (!validation.valid) {
          console.error("[TG Auth] Invalid initData format:", validation.reason);
          onUpdate({
            webApp: telegramWebApp,
            initDataRaw: resolvedInitData,
            error: `Invalid initData: ${validation.reason}`,
            isReady: true,
            debugInfo: { 
              ...debugInfo, 
              authStatus: "invalid_format", 
              initDataLength: resolvedInitData.length 
            },
          });
          return;
        }

        // Store for future use
        initDataRef.current = resolvedInitData;
        debugInfo.initDataLength = resolvedInitData.length;
        
        console.log("[TG Auth] initData validated", {
          source: initDataSource,
          length: resolvedInitData.length,
          preview: resolvedInitData.substring(0, 50) + "...",
        });

        // Parse initData for context
        const parsedInitData = parseInitDataRaw(resolvedInitData);
        
        // Set initData in API client
        apiClient.setInitDataRaw(resolvedInitData);
        
        // Authenticate with backend
        console.log("[TG Auth] Authenticating with backend...", {
          apiUrl: apiClient.getBaseUrl(),
          initDataLength: resolvedInitData.length,
        });
        debugInfo.authStatus = "authenticating";
        
        try {
          const authResponse = await apiClient.validateAuth(resolvedInitData);

          if (authResponse.valid && authResponse.user) {
            console.log("[TG Auth] Authentication successful for user:", authResponse.user.id);
            hasAuthenticatedRef.current = true;
            
            // Convert server response (snake_case) to User format (camelCase)
            const user = serverUserToUser(authResponse.user);
            
            onUpdate({
              webApp: telegramWebApp,
              user: user,
              initDataRaw: resolvedInitData,
              initData: parsedInitData as InitData | null,
              tokens: {
                accessToken: apiClient.getAccessToken() || "",
                refreshToken: localStorage.getItem("refreshToken") || "",
              },
              error: null,
              isReady: true,
              debugInfo: { ...debugInfo, authStatus: "authenticated" },
            });
          } else {
            console.error("[TG Auth] Authentication failed - invalid response:", {
              valid: authResponse.valid,
              hasUser: !!authResponse.user,
              userId: authResponse.user?.id,
            });
            
            // Check browser console for detailed error logs from API client
            const errorMessage = "Authentication failed. Check browser console for details.";
            
            onUpdate({
              webApp: telegramWebApp,
              initDataRaw: resolvedInitData,
              initData: parsedInitData as InitData | null,
              error: errorMessage,
              isReady: true,
              debugInfo: { 
                ...debugInfo, 
                authStatus: "auth_failed",
                authError: "Response was invalid or missing user data",
              },
            });
          }
        } catch (authError) {
          const errorMsg = authError instanceof Error ? authError.message : String(authError);
          console.error("[TG Auth] Authentication exception:", authError);
          
          onUpdate({
            webApp: telegramWebApp,
            initDataRaw: resolvedInitData,
            initData: parsedInitData as InitData | null,
            error: `Authentication error: ${errorMsg}`,
            isReady: true,
            debugInfo: { 
              ...debugInfo, 
              authStatus: "auth_failed",
              authError: errorMsg,
            },
          });
        }

        // Notify Telegram that the app is ready
        telegramWebApp.ready();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Initialization failed";
        console.error("[TG Auth] Bootstrap error:", err);
        onUpdate({ 
          error: msg, 
          isReady: false,
          debugInfo: { ...debugInfo, authStatus: `error: ${msg}` },
        });
      }
    };

    run();
  }, [sdkRawInitData, onUpdate]);

  return null;
}
