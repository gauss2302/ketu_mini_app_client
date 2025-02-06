// src/components/bottom-nav.tsx

"use client";
import { Home, Ticket, Heart, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Ticket, label: "Tickets", path: "/login" },
    { icon: Heart, label: "Saved", path: "/saved" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-8">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center"
            >
              {React.createElement(item.icon, {
                className: `w-6 h-6 ${
                  isActive ? "text-[#FF7352]" : "text-gray-400"
                }`,
                fill: isActive ? "currentColor" : "none",
              })}
              <span
                className={`text-xs mt-1 ${
                  isActive ? "text-[#FF7352]" : "text-gray-400"
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
