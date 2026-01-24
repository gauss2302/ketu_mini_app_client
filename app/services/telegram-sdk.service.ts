// app/services/telegram-sdk.service.ts
"use client";

import { retrieveRawInitData, init } from "@telegram-apps/sdk";

export class TelegramSDKService {
  private static instance: TelegramSDKService | null = null;
  private _initDataRaw: string | undefined = undefined;
  private _error: Error | null = null;
  private _isInitialized: boolean = false;
  private _cleanup: VoidFunction | null = null;

  private constructor() {
    console.log("TelegramSDKService constructor called");
  }

  public static getInstance(): TelegramSDKService {
    if (!TelegramSDKService.instance) {
      TelegramSDKService.instance = new TelegramSDKService();
    }
    return TelegramSDKService.instance;
  }

  public async initialize(): Promise<void> {
    if (this._isInitialized) {
      console.log("Telegram SDK already initialized");
      return;
    }

    console.log("Starting Telegram SDK initialization");
    try {
      if (typeof window === "undefined") {
        throw new Error("Telegram SDK can only be initialized on client side");
      }

      // Check if running in Telegram Web App
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).Telegram?.WebApp) {
        throw new Error("Not running in Telegram Web App environment");
      }

      this._cleanup = init();
      console.log("Telegram SDK initialized with init()");

      this._initDataRaw = retrieveRawInitData();
      if (!this._initDataRaw) {
        throw new Error("Failed to retrieve initData");
      }

      this._isInitialized = true;
      this._error = null;
      console.log(
        "Telegram SDK initialized successfully with initData:",
        this._initDataRaw,
      );

      // Send to backend
      await this.sendToBackend();
    } catch (error) {
      this._error =
        error instanceof Error
          ? error
          : new Error("Unknown initialization error");
      this._isInitialized = false;
      console.error("Failed to initialize Telegram SDK:", this._error);
    }
  }

  public async sendToBackend(): Promise<void> {
    if (!this._initDataRaw) {
      console.error("Cannot send data to backend: initData not available");
      return;
    }

    // Authentication is now handled by api-client.service.ts via validateAuth()
    // This method is kept for backwards compatibility but can be removed if not needed
    console.log(
      "InitData available for authentication:",
      this._initDataRaw ? "Yes" : "No",
    );
  }
  public getInitDataRaw(): string | undefined {
    return this._initDataRaw;
  }

  public getError(): Error | null {
    return this._error;
  }

  public isReady(): boolean {
    return this._isInitialized;
  }

  public cleanup(): void {
    if (this._cleanup) {
      console.log("Cleaning up Telegram SDK");
      this._cleanup();
      this._cleanup = null;
    }
  }
}

export const telegramSDK = TelegramSDKService.getInstance();
