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
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SettingsIcon = Settings as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChevronRightIcon = ChevronRight as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MapPinIcon = MapPin as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StarIcon = Star as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeartIcon = Heart as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GiftIcon = Gift as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HelpCircleIcon = HelpCircle as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BellIcon = Bell as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LogOutIcon = LogOut as any;
import { useRouter } from "next/navigation";
import { apiClient, BackendUser } from "@/app/services/api-client.service";
import { useTelegram } from "@/app/components/providers/telegram-provider";

const ProfilePage = () => {
  const { isReady } = useTelegram();
  const [profile, setProfile] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      if (!isReady) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await apiClient.getUserProfile();
        setProfile(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load profile";
        console.error("Profile load failed", error);
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isReady]);

  const menuItems = [
    { icon: GiftIcon, label: "My Bookings", badge: "2 Active" },
    { icon: HeartIcon, label: "Saved Places", badge: "12 Places" },
    { icon: BellIcon, label: "Notifications", badge: "3 New" },
    { icon: HelpCircleIcon, label: "Help Center" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white px-4 pt-6 pb-4">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <button
            onClick={() => router.push("/settings")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <SettingsIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div
              className="w-16 h-16 bg-[#FF7352] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {profile?.first_name?.[0] || "U"}
          </div>


          <div>
            <h2 className="font-semibold text-lg">
              {profile?.first_name
                  ? `${profile.first_name} ${profile.last_name || ""}`
                  : "User"}
            </h2>
            <div className={"flex items-center space-x-4"}>
              {profile?.id}
            </div>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPinIcon className="w-4 h-4 mr-1"/>
              Tashkent, Uzbekistan
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white mt-2 px-4 py-4">
        {isLoading && (
          <div className="text-sm text-gray-500">Loading profile...</div>
        )}
        {errorMessage && (
          <div className="text-sm text-red-500">{errorMessage}</div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-[#FF7352]">12</div>
            <div className="text-sm text-gray-500">Places Visited</div>
          </div>
          <div className="text-center border-x">
            <div className="text-2xl font-semibold text-[#FF7352]">43</div>
            <div className="text-sm text-gray-500">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-[#FF7352]">4.8</div>
            <div className="text-sm text-gray-500">Rating</div>
          </div>
        </div>
      </div>

      {/* Membership Card */}
      <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#FF7352] to-[#ff8668] rounded-2xl text-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-sm opacity-90 mb-1">Membership</div>
            <div className="font-semibold">Premium Member: {profile?.is_premium ? "PREM" : "NO"}</div>
            <div className={"flex flex-col items-left"}>
              <p>
                {profile?.first_name}
              </p>
              <p>
                {profile?.username}
              </p>
              <p>
                Lanugage: {profile?.language_code}
              </p>
              {/*<Image*/}
              {/*src={initDataForTest.picture_url!.toString()}*/}
              {/*width={30}*/}
              {/*height={30}*/}
              {/*alt={initDataForTest!.picture_url?.toString()}*/}
              {/*/>*/}
            </div>
          </div>
          <StarIcon className="w-6 h-6 fill-current"/>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm opacity-90 mb-1">Valid Until</div>
            <div className="font-semibold">Dec 2024</div>
          </div>
          <div className="text-sm opacity-90">ID: {profile?.id || "12345"}</div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white mt-4 py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-[#FF7352]" />
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="text-sm text-gray-500">{item.badge}</span>
              )}
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-4">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-500 bg-red-50 rounded-xl">
          <LogOutIcon className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
