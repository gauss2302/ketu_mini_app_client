export const initTelegramApp = () => {
	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window === "undefined" || !(window as any).Telegram?.WebApp) {
		console.warn("Telegram WebApp context unavailable during initialization");
		return null;
	}

	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webApp = (window as any).Telegram.WebApp;

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
