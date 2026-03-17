// src/components/bottom-nav.tsx

"use client";
import { Home, Ticket, Heart, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  interface NavigationItems {
    icon: React.ElementType;
    label: string;
    path: string;
  }

  const navItems: NavigationItems[] = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Ticket, label: "Tickets", path: "/login" },
    { icon: Heart, label: "Saved", path: "/saved" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t theme-divider px-8 py-2 backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02), transparent), var(--app-surface-elevated)",
      }}
    >
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center rounded-2xl px-3 py-2 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
              type="button"
            >
              {React.createElement(item.icon, {
                className: `w-6 h-6 ${
                  isActive ? "text-[#FF7352]" : "theme-muted"
                }`,
                fill: isActive ? "currentColor" : "none",
              })}
              <span
                className={`text-xs mt-1 ${
                  isActive ? "text-[#FF7352]" : "theme-muted"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
