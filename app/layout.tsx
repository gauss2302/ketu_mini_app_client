import Script from "next/script";
import { TelegramProvider } from "@/app/components/providers/telegram-provider";
import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
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
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}
