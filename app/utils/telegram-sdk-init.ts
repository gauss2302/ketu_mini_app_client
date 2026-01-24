"use client";

/**
 * Telegram SDK initialization per @telegram-apps/sdk-react and production practices.
 * @see https://habr.com/ru/companies/doubletapp/articles/917286/
 * @see https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk
 */
import {
  init,
  backButton,
  viewport,
  miniApp,
  themeParams,
  restoreInitData,
} from "@telegram-apps/sdk-react";

/** Run once when running inside Telegram Web App. Idempotent. */
export async function initTelegramSDK(): Promise<void> {
  if (typeof window === "undefined") return;

  init();

  if (!backButton.isSupported() || !miniApp.isSupported()) {
    throw new Error("ERR_NOT_SUPPORTED: backButton or miniApp not supported");
  }

  if (backButton.mount.isAvailable() && !backButton.isMounted()) {
    backButton.mount();
  }
  if (miniApp.mountSync.isAvailable() && !miniApp.isMounted()) {
    miniApp.mountSync();
  }
  if (themeParams.mountSync.isAvailable() && !themeParams.isMounted()) {
    themeParams.mountSync();
  }

  restoreInitData();

  if (viewport.mount.isAvailable() && !viewport.isMounted()) {
    await viewport.mount();
  }
  if (viewport.bindCssVars.isAvailable()) {
    viewport.bindCssVars();
  }
  if (miniApp.bindCssVars.isAvailable()) {
    miniApp.bindCssVars();
  }
  if (themeParams.bindCssVars.isAvailable()) {
    themeParams.bindCssVars();
  }
}
