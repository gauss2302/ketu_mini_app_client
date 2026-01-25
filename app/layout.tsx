import Script from "next/script";
import { TelegramProvider } from "@/app/components/providers/telegram-provider";
import { DebugPanel } from "@/app/components/debug-panel";
import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        <TelegramProvider>
          {children}
          {/* Debug panel for troubleshooting authentication issues */}
          <DebugPanel />
        </TelegramProvider>
      </body>
    </html>
  );
}
