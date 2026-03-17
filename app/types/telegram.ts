/**
 * Re-export official types from @telegram-apps/sdk-react.
 * These types are the source of truth for Telegram Mini App development
 */

// Re-export official types from the SDK
export type {
  InitData,
  LaunchParams,
  Chat,
  ThemeParams,
} from "@telegram-apps/sdk-react";

/**
 * User type for our application
 * Uses camelCase to match SDK conventions
 */
export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
  allowsWriteToPm?: boolean;
}

/**
 * Extended window type for accessing Telegram WebApp from global scope
 * This is the raw window.Telegram.WebApp object before SDK initialization
 */
export interface TelegramWebAppRaw {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  // Bot API 6.1+ methods
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  // Bot API 6.2+ methods
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
}

/**
 * Window type augmentation for Telegram WebApp
 */
export type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebAppRaw;
  };
};

/**
 * Server response user type (snake_case format from backend)
 * This matches the format returned by our Express server
 */
export interface ServerUser {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium: boolean;
  avatar_url?: string;
}

/**
 * Auth response from server
 */
export interface AuthResponse {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: ServerUser;
}

/**
 * Convert ServerUser (snake_case) to User format (camelCase)
 */
export function serverUserToUser(serverUser: ServerUser): User {
  return {
    id: serverUser.id,
    username: serverUser.username,
    firstName: serverUser.first_name,
    lastName: serverUser.last_name,
    languageCode: serverUser.language_code,
    isPremium: serverUser.is_premium,
    photoUrl: serverUser.avatar_url,
  };
}

// Legacy export for backwards compatibility
export type TelegramWebApp = TelegramWebAppRaw;
