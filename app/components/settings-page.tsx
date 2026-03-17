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
  Sun,
  Smartphone,
} from "lucide-react";
import { useTheme, type ThemeMode } from "@/app/components/providers/theme-provider";

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

function ThemePreview({ mode }: { mode: ThemeMode }) {
  const previewContainerClassName =
    mode === "dark"
      ? "border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(120,167,214,0.24),_rgba(17,24,39,0.96)_58%)]"
      : mode === "light"
        ? "border-[#E8D7C5] bg-[radial-gradient(circle_at_top_left,_rgba(255,213,178,0.86),_rgba(255,250,244,0.96)_58%)]"
        : "border-sky-200/[0.35] bg-[linear-gradient(135deg,_rgba(236,244,255,0.94)_0%,_rgba(248,222,204,0.82)_45%,_rgba(18,24,34,0.86)_100%)] dark:border-sky-300/20";

  const previewTextClassName = mode === "dark" ? "bg-white/80" : "bg-slate-900/70";
  const previewChipClassName =
    mode === "dark"
      ? "bg-white/[0.14] text-white/75"
      : "bg-white/75 text-slate-700 shadow-sm";

  return (
    <div
      className={`h-24 w-full rounded-[22px] border p-3 shadow-sm transition-transform duration-200 group-hover:scale-[1.01] ${previewContainerClassName}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`h-2.5 w-20 rounded-full ${previewTextClassName}`} />
        <div className={`rounded-full px-2 py-1 text-[10px] font-medium ${previewChipClassName}`}>
          {mode === "telegram" ? "Sync" : mode === "dark" ? "Night" : "Day"}
        </div>
      </div>

      <div className="space-y-2">
        <div className={`h-2.5 w-full rounded-full ${previewTextClassName}`} />
        <div className="grid grid-cols-[1.6fr_1fr] gap-2">
          <div
            className={`h-8 rounded-2xl ${
              mode === "dark" ? "bg-white/[0.08]" : "bg-white/[0.72] shadow-sm"
            }`}
          />
          <div className="h-8 rounded-2xl bg-[#FF7352]/75" />
        </div>
      </div>
    </div>
  );
}

const themeOptions: Array<{
  mode: ThemeMode;
  label: string;
  caption: string;
  icon: LucideIcon;
}> = [
  {
    mode: "light",
    label: "Light",
    caption: "Warm daylight palette",
    icon: Sun,
  },
  {
    mode: "dark",
    label: "Dark",
    caption: "Low-glare evening palette",
    icon: Moon,
  },
  {
    mode: "telegram",
    label: "Telegram",
    caption: "Follow Telegram theme",
    icon: Smartphone,
  },
];

export const SettingsPage = () => {
  const router = useRouter();
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const currentThemeLabel =
    themeMode === "telegram" ? "Telegram sync" : resolvedTheme === "dark" ? "Dark mode" : "Light mode";

  const settingsSections: SettingsSection[] = [
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          type: "toggle",
          value: notifications,
          onChange: () => setNotifications((currentValue) => !currentValue),
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
      className="px-4 py-3 flex items-center justify-between transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
    >
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full theme-icon-bubble flex items-center justify-center">
          <item.icon className="w-5 h-5" />
        </div>
        <span className="font-medium">{item.label}</span>
      </div>
      {item.type === "toggle" ? (
        <button
          onClick={item.onChange}
          className={`relative h-6 w-11 rounded-full border transition-all ${
            item.value
              ? "border-[#FF7352]/30 bg-[#FF7352] shadow-[0_10px_24px_rgba(255,115,82,0.24)]"
              : "theme-chip"
          }`}
          type="button"
        >
          <div
            className={`absolute top-0.5 left-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
              item.value ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      ) : (
        <button
          className="flex items-center theme-muted transition hover:text-[var(--app-text)]"
          onClick={item.onClick}
          type="button"
        >
          {item.value && <span className="mr-2 text-sm">{item.value}</span>}
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col theme-shell">
      <div className="flex-none theme-panel rounded-b-[28px] border-t-0 border-x-0 px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full mr-3"
          >
            <ArrowLeft className="w-6 h-6 theme-muted" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm theme-muted">Active appearance: {currentThemeLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <section className="theme-card rounded-[32px] p-5">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium theme-chip">
                Appearance Studio
              </div>
              <h2 className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] theme-muted">
                Appearance
              </h2>
              <p className="text-sm theme-muted mt-1 max-w-lg">
                Manual themes now use the app palette directly, so dark mode keeps readable text even
                when Telegram itself is light.
              </p>
            </div>

            <div className="theme-chip rounded-[22px] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] theme-muted">
                Current mode
              </div>
              <div className="mt-1 text-sm font-semibold">{currentThemeLabel}</div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] theme-muted">
              Appearance
            </h2>
            <p className="text-sm theme-muted mt-1">
              Choose a fixed theme or keep the interface synced with Telegram.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {themeOptions.map((option) => {
              const isActive = themeMode === option.mode;

              return (
                <button
                  key={option.mode}
                  onClick={() => setThemeMode(option.mode)}
                  className={`group rounded-[26px] border px-4 py-4 text-left transition-all ${
                    isActive
                      ? "border-[#FF7352]/40 bg-[#FF7352]/10 shadow-[0_18px_40px_rgba(255,115,82,0.12)]"
                      : "theme-card hover:-translate-y-0.5 hover:border-[var(--app-border-strong)]"
                  }`}
                  type="button"
                >
                  <div className="flex flex-col gap-4">
                    <ThemePreview mode={option.mode} />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl theme-icon-bubble flex items-center justify-center">
                          <option.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-sm theme-muted">{option.caption}</div>
                        </div>
                      </div>
                      {isActive && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF7352] text-white shadow-sm">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {settingsSections.map((section) => (
          <section
            key={section.title}
            className="theme-card rounded-[28px] overflow-hidden"
          >
            <div className="px-4 py-3 border-b theme-divider">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] theme-muted">
                {section.title}
              </h2>
            </div>
            <div className="divide-y theme-divider">
              {section.items.map(renderSettingItem)}
            </div>
          </section>
        ))}

        <button
          onClick={() => console.log("Logout")}
          className="w-full flex items-center justify-center space-x-2 rounded-[24px] border border-red-500/20 bg-red-500/[0.08] px-4 py-4 text-red-500 transition hover:bg-red-500/[0.12]"
          type="button"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};
