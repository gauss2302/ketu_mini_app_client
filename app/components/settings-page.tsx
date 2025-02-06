// src/components/settings-page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Globe,
  Moon,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

type BaseSettingItem = {
  icon: LucideIcon;
  label: string;
};

type ToggleSettingItem = BaseSettingItem & {
  type: "toggle";
  value: boolean;
  onChange: () => void;
};

type LinkSettingItem = BaseSettingItem & {
  type: "link";
  value?: string;
  onClick: () => void;
};

type SettingItem = ToggleSettingItem | LinkSettingItem;

type SettingsSection = {
  title: string;
  items: SettingItem[];
};

export const SettingsPage = () => {
  const router = useRouter();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const settingsSections: SettingsSection[] = [
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          type: "toggle",
          value: notifications,
          onChange: () => setNotifications(!notifications),
        },
        {
          icon: Moon,
          label: "Dark Mode",
          type: "toggle",
          value: darkMode,
          onChange: () => setDarkMode(!darkMode),
        },
        {
          icon: Globe,
          label: "Language",
          type: "link",
          value: "English",
          onClick: () => console.log("Language settings"),
        },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        {
          icon: Shield,
          label: "Privacy Settings",
          type: "link",
          onClick: () => console.log("Privacy settings"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          type: "link",
          onClick: () => console.log("Help center"),
        },
        {
          icon: Info,
          label: "About",
          type: "link",
          onClick: () => console.log("About"),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <div
      key={item.label}
      className="px-4 py-3 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <item.icon className="w-5 h-5 text-[#FF7352]" />
        </div>
        <span className="font-medium">{item.label}</span>
      </div>
      {item.type === "toggle" ? (
        <button
          onClick={item.onChange}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            item.value ? "bg-[#FF7352]" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
              item.value ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      ) : (
        <div
          className="flex items-center text-gray-400 cursor-pointer"
          onClick={item.onClick}
        >
          {item.value && <span className="mr-2 text-sm">{item.value}</span>}
          <ChevronRight className="w-5 h-5" />
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-none bg-white px-4 py-4 border-b">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full mr-3"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        {settingsSections.map((section, idx) => (
          <div
            key={section.title}
            className={`bg-white ${idx > 0 ? "mt-4" : ""}`}
          >
            <div className="px-4 py-2">
              <h2 className="text-sm font-medium text-gray-500">
                {section.title}
              </h2>
            </div>
            <div className="divide-y">
              {section.items.map(renderSettingItem)}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={() => console.log("Logout")}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-500 bg-white rounded-xl border border-red-100"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
