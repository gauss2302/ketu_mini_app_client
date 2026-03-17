"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/app/modules/auth/services/auth-client.service";
import { retrieveRawInitData } from "@telegram-apps/sdk";
import type { TelegramWindow, InitData } from "@/app/types/telegram";
import { serverUserToUser } from "@/app/types/telegram";
import { initTelegramSDK } from "@/app/utils/telegram-sdk-init";
import type { TelegramContextType } from "./telegram-context";

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
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
  const hasInitializedRef = useRef(false);
  const hasAuthenticatedRef = useRef(false);
  const isAuthenticatingRef = useRef(false);
  const initDataRef = useRef<string | null>(null);

  useEffect(() => {
    const run = async () => {
      // Prevent multiple authentication attempts
      if (hasAuthenticatedRef.current || isAuthenticatingRef.current) {
        return;
      }
      isAuthenticatingRef.current = true;

      const debugInfo: TelegramContextType["debugInfo"] = {
        authStatus: "starting",
      };

      try {
        const telegramWebApp =
          typeof window !== "undefined"
            ? (window as TelegramWindow).Telegram?.WebApp
            : null;

        if (telegramWebApp) {
          debugInfo.sdkVersion = telegramWebApp.version;
        } else {
          debugInfo.authStatus = "no_webapp";
          console.warn("[TG Auth] Telegram WebApp object is unavailable, trying SDK launch params fallback");
        }

        // Initialize SDK if not already done
        if (!hasInitializedRef.current && telegramWebApp) {
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

        // Prefer Telegram WebApp raw initData (query string) first.
        let resolvedInitData: string | null | undefined = initDataRef.current;
        let initDataSource = "cached";
        let sdkRawInitData: string | null | undefined = null;

        if (!resolvedInitData) {
          resolvedInitData = telegramWebApp?.initData;
          if (resolvedInitData) {
            initDataSource = "window.Telegram.WebApp.initData";
            console.log("[TG Auth] Got initData from window.Telegram.WebApp.initData");
          }
        }

        if (!resolvedInitData) {
          try {
            sdkRawInitData = retrieveRawInitData();
          } catch (e) {
            console.warn("[TG Auth] retrieveRawInitData() failed:", e);
          }

          resolvedInitData = sdkRawInitData;
          if (resolvedInitData) {
            initDataSource = "retrieveRawInitData()";
            console.log("[TG Auth] Got initData from retrieveRawInitData()");
          }
        }

        if (!resolvedInitData) {
          console.warn("[TG Auth] No initData available from any source");
          onUpdate({
            webApp: telegramWebApp,
            error: "No initData available. Make sure the app is opened from Telegram.",
            isReady: !!telegramWebApp,
            theme: telegramWebApp
              ? {
                  colorScheme: telegramWebApp.colorScheme,
                  isDark: telegramWebApp.colorScheme === "dark",
                }
              : {
                  colorScheme: "light",
                  isDark: false,
                },
            debugInfo: { ...debugInfo, authStatus: "no_init_data", initDataLength: 0 },
          });
          return;
        }

        if (!resolvedInitData.trim()) {
          onUpdate({
            webApp: telegramWebApp,
            error: "Telegram initData is empty",
            isReady: !!telegramWebApp,
            theme: telegramWebApp
              ? {
                  colorScheme: telegramWebApp.colorScheme,
                  isDark: telegramWebApp.colorScheme === "dark",
                }
              : {
                  colorScheme: "light",
                  isDark: false,
                },
            debugInfo: { ...debugInfo, authStatus: "empty_init_data", initDataLength: 0 },
          });
          return;
        }

        // Store for future use
        initDataRef.current = resolvedInitData;
        debugInfo.initDataLength = resolvedInitData.length;
        
        console.log(`[TG Auth] initData validated: ${safeJson({
          source: initDataSource,
          length: resolvedInitData.length,
          preview: resolvedInitData.substring(0, 50) + "...",
        })}`);

        // Parse initData for context
        const parsedInitData = parseInitDataRaw(resolvedInitData);
        
        // Set initData in API client
        authClient.setInitDataRaw(resolvedInitData);
        
        // Authenticate with backend
        console.log(`[TG Auth] Authenticating with backend: ${safeJson({
          apiUrl: authClient.getBaseUrl(),
          initDataLength: resolvedInitData.length,
        })}`);
        debugInfo.authStatus = "authenticating";
        
        try {
          const authResponse = await authClient.validateAuth(resolvedInitData);

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
                accessToken: authClient.getAccessToken() || "",
                refreshToken: localStorage.getItem("refreshToken") || "",
              },
              error: null,
              isReady: !!telegramWebApp,
              theme: telegramWebApp
                ? {
                    colorScheme: telegramWebApp.colorScheme,
                    isDark: telegramWebApp.colorScheme === "dark",
                  }
                : {
                    colorScheme: "light",
                    isDark: false,
                  },
              debugInfo: { ...debugInfo, authStatus: "authenticated" },
            });
          } else {
            console.error(`[TG Auth] Authentication failed - invalid response: ${safeJson({
              valid: authResponse.valid,
              hasUser: !!authResponse.user,
              userId: authResponse.user?.id,
              status: authResponse.status,
              code: authResponse.code,
              error: authResponse.error,
            })}`);
            
            const errorMessage = authResponse.error
              ? `Authentication failed: ${authResponse.error}`
              : "Authentication failed. Check browser console for details.";
            
            onUpdate({
              webApp: telegramWebApp,
              initDataRaw: resolvedInitData,
              initData: parsedInitData as InitData | null,
              error: errorMessage,
              isReady: !!telegramWebApp,
              theme: telegramWebApp
                ? {
                    colorScheme: telegramWebApp.colorScheme,
                    isDark: telegramWebApp.colorScheme === "dark",
                  }
                : {
                    colorScheme: "light",
                    isDark: false,
                  },
              debugInfo: { 
                ...debugInfo, 
                authStatus: "auth_failed",
                authError: authResponse.error || "Response was invalid or missing user data",
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
            isReady: !!telegramWebApp,
            theme: telegramWebApp
              ? {
                  colorScheme: telegramWebApp.colorScheme,
                  isDark: telegramWebApp.colorScheme === "dark",
                }
              : {
                  colorScheme: "light",
                  isDark: false,
                },
            debugInfo: { 
              ...debugInfo, 
              authStatus: "auth_failed",
              authError: errorMsg,
            },
          });
        }

        // Notify Telegram that the app is ready
        telegramWebApp?.ready();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Initialization failed";
        console.error("[TG Auth] Bootstrap error:", err);
        const telegramWebApp =
          typeof window !== "undefined"
            ? (window as TelegramWindow).Telegram?.WebApp
            : null;
        onUpdate({ 
          error: msg, 
          isReady: false,
          theme: telegramWebApp ? {
            colorScheme: telegramWebApp.colorScheme,
            isDark: telegramWebApp.colorScheme === "dark",
          } : {
            colorScheme: "light",
            isDark: false,
          },
          debugInfo: { ...debugInfo, authStatus: `error: ${msg}` },
        });
      } finally {
        isAuthenticatingRef.current = false;
      }
    };

    run();
  }, [onUpdate]);

  return null;
}
