"use client";

/**
 * Telegram SDK initialization per @telegram-apps/sdk-react.
 */
import {
  init,
  backButton,
  viewport,
  miniApp,
  themeParams,
  restoreInitData,
} from "@telegram-apps/sdk-react";

let sdkInitPromise: Promise<void> | null = null;

/** Run once when running inside Telegram Web App. Idempotent. */
export async function initTelegramSDK(): Promise<void> {
  if (typeof window === "undefined") return;

  if (sdkInitPromise) {
    return sdkInitPromise;
  }

  sdkInitPromise = (async () => {
    init();

    if (!backButton.isSupported() || !miniApp.isSupported()) {
      throw new Error("ERR_NOT_SUPPORTED: backButton or miniApp not supported");
    }

    if (backButton.mount.isAvailable() && !backButton.isMounted()) {
      backButton.mount();
    }
    if (miniApp.mountSync.isAvailable() && !miniApp.isMounted() && !miniApp.isMounting()) {
      miniApp.mountSync();
    }
    if (themeParams.mountSync.isAvailable() && !themeParams.isMounted() && !themeParams.isMounting()) {
      themeParams.mountSync();
    }

    restoreInitData();

    if (viewport.mount.isAvailable() && !viewport.isMounted()) {
      if (viewport.isMounting()) {
        const mounting = viewport.mountPromise();
        if (mounting) {
          await mounting;
        }
      } else {
        await viewport.mount();
      }
    }

    if (viewport.bindCssVars.isAvailable() && !viewport.isCssVarsBound()) {
      viewport.bindCssVars();
    }
    if (miniApp.bindCssVars.isAvailable() && !miniApp.isCssVarsBound()) {
      miniApp.bindCssVars();
    }
    if (themeParams.bindCssVars.isAvailable() && !themeParams.isCssVarsBound()) {
      themeParams.bindCssVars();
    }
  })().catch((error) => {
    sdkInitPromise = null;
    throw error;
  });

  await sdkInitPromise;
}
