"use client";

import { useCallback, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import {
  TelegramContext,
  defaultTelegramContext,
  useTelegram,
  type TelegramContextType,
} from "./telegram-context";
import { ThemeProvider } from "./theme-provider";

const TelegramBootstrap = dynamic(
  () =>
    import("./telegram-bootstrap").then((m) => ({
      default: m.TelegramBootstrap,
    })),
  { ssr: false },
);

/** SSR-safe: holds context state; Bootstrap (client-only) runs SDK init and updates it. */
export function TelegramProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<TelegramContextType>(defaultTelegramContext);

  const onUpdate = useCallback((partial: Partial<TelegramContextType>) => {
    setCtx((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <TelegramContext.Provider value={ctx}>
      <ThemeProvider>
        {children}
        <TelegramBootstrap onUpdate={onUpdate} />
      </ThemeProvider>
    </TelegramContext.Provider>
  );
}

export { useTelegram, TelegramContext };
