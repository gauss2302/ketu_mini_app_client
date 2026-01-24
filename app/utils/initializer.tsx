import type { TelegramWebApp } from "@/app/types/telegram";

type TelegramWindow = Window & { Telegram?: { WebApp?: TelegramWebApp } };

export const initTelegramApp = () => {
  const telegramWebApp =
    typeof window !== "undefined"
      ? (window as TelegramWindow).Telegram?.WebApp
      : null;
  if (!telegramWebApp) {
		console.warn("Telegram WebApp context unavailable during initialization");
		return null;
	}

  const webApp = telegramWebApp;

	// Enable closing confirmation
	webApp.enableClosingConfirmation();

	// Expand the WebApp to full height
	webApp.expand();

	// Set the header color
	webApp.setHeaderColor("#ecc533");

	// Set the background color
	webApp.setBackgroundColor("#ef6363");

	// Log initialization status
	console.log("Telegram WebApp initialized with version:", webApp.version);
	console.log("WebApp platform:", webApp.platform);
	console.log("WebApp colorScheme:", webApp.colorScheme);
	console.log("WebApp initData:", webApp.initData);

	return webApp;
};
