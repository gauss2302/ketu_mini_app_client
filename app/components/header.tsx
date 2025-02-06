"use client";

import { useTelegram } from "./providers/telegram-provider";

export const Header = () => {
  const { webApp, user } = useTelegram();

  return (
    <header className="bg-[#3390ec] text-white">
      <div className="max-w-xl mx-auto">
        {/* Top bar with user info */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user?.first_name && (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center uppercase font-medium">
                {user.first_name[0]}
              </div>
            )}
            <div>
              <p className="font-medium">
                {user
                  ? `${user.first_name} ${user.last_name || ""}`
                  : "Telegram User"}
              </p>
              {user?.username && (
                <p className="text-sm text-white/70">@{user.username}</p>
              )}
            </div>
          </div>

          {/* Platform badge */}
          {webApp?.platform && (
            <div className="px-2 py-1 rounded-md bg-white/10 text-sm">
              {webApp.platform}
            </div>
          )}
        </div>

        {/* Bottom bar with additional info */}
        <div className="px-4 py-2 bg-black/10 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span>v{webApp?.version || "0.0.0"}</span>
            <span>{webApp?.colorScheme || "light"} mode</span>
          </div>
          <div>ID: {user?.id || "unknown"}</div>
        </div>
      </div>
    </header>
  );
};
