/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TelegramUser } from "@/app/types/telegram";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";

interface TelegramContextType {
  webApp: any | null;
  user: TelegramUser | null;
  initDataRaw: string;
  initData: any;
}

const defaultContext: TelegramContextType = {
  webApp: null,
  user: null,
  initDataRaw: "",
  initData: null,
};

const TelegramContext = createContext<TelegramContextType>(defaultContext);

function parseInitData(initDataRaw: string) {
  try {
    // Split the parameters
    const params = new URLSearchParams(initDataRaw);
    const decoded: Record<string, any> = {};

    // Convert to object
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

export function TelegramProvider({ children }: PropsWithChildren) {
  const [webApp, setWebApp] = useState<any | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initDataRaw, setInitDataRaw] = useState<string>("");
  const [initData, setInitData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const app = window.Telegram?.WebApp;
      setWebApp(app);

      if (app) {
        // Get raw init data
        const rawData = app.initData;
        setInitDataRaw(rawData);

        // Parse init data
        const parsedData = parseInitData(rawData);
        setInitData(parsedData);

        // Set user data
        if (app.initDataUnsafe?.user) {
          setUser(app.initDataUnsafe.user);
        }

        app.ready();

        // Log for debugging
        console.log("Raw Init Data:", rawData);
        console.log("Parsed Init Data:", parsedData);
        console.log("User Data:", app.initDataUnsafe?.user);
      }
    }
  }, []);

  const value: TelegramContextType = {
    webApp,
    user,
    initDataRaw,
    initData,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram(): TelegramContextType {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
}
