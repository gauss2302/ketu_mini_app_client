/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}
