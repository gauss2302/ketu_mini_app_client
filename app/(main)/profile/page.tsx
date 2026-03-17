"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  ChevronRight,
  MapPin,
  Star,
  Heart,
  Gift,
  HelpCircle,
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react";

const SettingsIcon: LucideIcon = Settings;
const ChevronRightIcon: LucideIcon = ChevronRight;
const MapPinIcon: LucideIcon = MapPin;
const StarIcon: LucideIcon = Star;
const HeartIcon: LucideIcon = Heart;
const GiftIcon: LucideIcon = Gift;
const HelpCircleIcon: LucideIcon = HelpCircle;
const BellIcon: LucideIcon = Bell;
const LogOutIcon: LucideIcon = LogOut;
import { useRouter } from "next/navigation";
import { authClient } from "@/app/modules/auth/services/auth-client.service";
import { userClient } from "@/app/modules/user/services/user-client.service";
import type { BackendUser } from "@/app/modules/user/types/user.types";
import { useTelegram } from "@/app/components/providers/telegram-provider";
import type { TelegramWebApp } from "@/app/types/telegram";
import { LoadingIndicator, SkeletonBlock } from "@/app/components/ui/loading-indicator";

type TelegramWindow = Window & { Telegram?: { WebApp?: TelegramWebApp } };

const ProfilePage = () => {
  const { isReady, user } = useTelegram();
  const [profile, setProfile] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.logout();
    router.push("/");
  };

  useEffect(() => {
    const loadProfile = async () => {
      // Wait for Telegram SDK to be ready
      if (!isReady) {
        setIsLoading(true);
        return;
      }

      // Check if we have authentication (either user from context or access token)
      const hasAuth = !!user || !!authClient.getAccessToken();
      
      // Check if we have initData available (authentication might be in progress)
      const initDataRaw =
        authClient.getInitDataRaw() ||
        (typeof window !== "undefined"
          ? (window as TelegramWindow).Telegram?.WebApp?.initData || null
          : null);
      const hasInitData = !!initDataRaw;

      if (!hasAuth && !hasInitData) {
        setIsLoading(false);
        setErrorMessage("Sign in required. Open this app from Telegram.");
        return;
      }

      // If token is still missing, perform one explicit auth attempt.
      if (!hasAuth && hasInitData) {
        const authResult = await authClient.validateAuth(initDataRaw || undefined);
        if (!authResult.valid || !authClient.getAccessToken()) {
          setIsLoading(false);
          setErrorMessage(
            authResult.error ||
              "Authentication failed. Open this app from Telegram and try again."
          );
          return;
        }
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await userClient.getProfile();
        setProfile(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load profile";
        console.error("Profile load failed", error);
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isReady, user]);

  const menuItems = [
    { icon: GiftIcon, label: "My Bookings", badge: "2 Active" },
    { icon: HeartIcon, label: "Saved Places", badge: "12 Places" },
    { icon: BellIcon, label: "Notifications", badge: "3 New" },
    { icon: HelpCircleIcon, label: "Help Center" },
  ];
  const showProfileSkeleton = isLoading && !profile;

  return (
    <div className="min-h-screen theme-shell">
      <div className="theme-panel rounded-b-[32px] border-t-0 border-x-0 px-4 pt-6 pb-5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] theme-muted">Account</p>
            <h1 className="mt-2 text-2xl font-bold">Profile</h1>
          </div>
          <button
            onClick={() => router.push("/settings")}
            className="theme-chip rounded-full p-2 transition hover:scale-105"
            type="button"
          >
            <SettingsIcon className="w-6 h-6 theme-muted" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {showProfileSkeleton ? (
            <SkeletonBlock className="w-16 h-16 rounded-full" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7352] via-[#ff8668] to-[#ffb29c] text-2xl font-semibold text-white shadow-[0_18px_38px_rgba(255,115,82,0.28)]">
              {profile?.first_name?.[0] || "U"}
            </div>
          )}

          <div className="min-w-[180px]">
            {showProfileSkeleton ? (
              <div className="space-y-2">
                <SkeletonBlock className="h-6 w-40" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-32" />
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-lg">
                  {profile?.first_name
                    ? `${profile.first_name} ${profile.last_name || ""}`
                    : "User"}
                </h2>
                <div className="mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium theme-chip">
                  ID {profile?.id}
                </div>
                <div className="flex items-center theme-muted text-sm mt-1">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  Tashkent, Uzbekistan
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="theme-card mx-4 mt-3 rounded-[30px] px-4 py-5">
        {isLoading && (
          <LoadingIndicator label="Loading profile..." compact className="justify-start py-0 mb-3" />
        )}
        {errorMessage && (
          <div className="theme-danger-card rounded-2xl px-4 py-3 text-sm">{errorMessage}</div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <div className="theme-soft-card rounded-[24px] px-3 py-4 text-center">
            {showProfileSkeleton ? (
              <SkeletonBlock className="h-8 w-10 mx-auto" />
            ) : (
              <div className="text-2xl font-semibold text-[#FF7352]">12</div>
            )}
            <div className="text-sm theme-muted">Places Visited</div>
          </div>
          <div className="theme-soft-card rounded-[24px] px-3 py-4 text-center">
            {showProfileSkeleton ? (
              <SkeletonBlock className="h-8 w-10 mx-auto" />
            ) : (
              <div className="text-2xl font-semibold text-[#FF7352]">43</div>
            )}
            <div className="text-sm theme-muted">Reviews</div>
          </div>
          <div className="theme-soft-card rounded-[24px] px-3 py-4 text-center">
            {showProfileSkeleton ? (
              <SkeletonBlock className="h-8 w-10 mx-auto" />
            ) : (
              <div className="text-2xl font-semibold text-[#FF7352]">4.8</div>
            )}
            <div className="text-sm theme-muted">Rating</div>
          </div>
        </div>
      </div>

      <div className="relative mx-4 mt-4 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#FF7352] via-[#ff8668] to-[#ff9f7f] p-5 text-white shadow-[0_22px_48px_rgba(255,115,82,0.28)]">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute bottom-0 right-10 h-20 w-20 rounded-full bg-black/10 blur-2xl" />

        <div className="relative mb-8 flex justify-between items-start">
          <div>
            <div className="mb-1 text-sm opacity-90">Membership</div>
            <div className="font-semibold">
              Premium Member: {profile?.is_premium ? "PREM" : "NO"}
            </div>
            <div className="mt-3 flex flex-col items-start">
              {showProfileSkeleton ? (
                <div className="space-y-2 mt-2">
                  <SkeletonBlock className="h-4 w-32 bg-white/35" />
                  <SkeletonBlock className="h-4 w-28 bg-white/35" />
                  <SkeletonBlock className="h-4 w-36 bg-white/35" />
                </div>
              ) : (
                <>
                  <p>{profile?.first_name}</p>
                  <p>{profile?.username}</p>
                  <p>Language: {profile?.language_code}</p>
                </>
              )}
            </div>
          </div>
          <StarIcon className="w-6 h-6 fill-current" />
        </div>
        <div className="relative flex justify-between items-end">
          <div>
            <div className="text-sm opacity-90 mb-1">Valid Until</div>
            <div className="font-semibold">Dec 2024</div>
          </div>
          <div className="text-sm opacity-90">ID: {profile?.id || "12345"}</div>
        </div>
      </div>

      <div className="theme-card mt-4 mx-4 overflow-hidden rounded-[30px] py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
            type="button"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full theme-icon-bubble flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="text-sm theme-muted">{item.badge}</span>
              )}
              <ChevronRightIcon className="w-5 h-5 theme-muted" />
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">
        <button
          onClick={handleLogout}
          className="theme-danger-card flex w-full items-center justify-center space-x-2 rounded-2xl px-4 py-3 transition hover:brightness-105"
          type="button"
        >
          <LogOutIcon className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
