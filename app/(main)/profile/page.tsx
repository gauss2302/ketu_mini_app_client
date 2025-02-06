"use client";

import React from "react";
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
import { useTelegram } from "@/app/components/providers/telegram-provider";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user } = useTelegram();
  const router = useRouter();

  const menuItems = [
    { icon: Gift, label: "My Bookings", badge: "2 Active" },
    { icon: Heart, label: "Saved Places", badge: "12 Places" },
    { icon: Bell, label: "Notifications", badge: "3 New" },
    { icon: HelpCircle, label: "Help Center" },
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
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[#FF7352] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {user?.first_name?.[0] || "U"}
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`
                : "User"}
            </h2>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              Tashkent, Uzbekistan
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white mt-2 px-4 py-4">
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
            <div className="font-semibold">Premium Member</div>
          </div>
          <Star className="w-6 h-6 fill-current" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm opacity-90 mb-1">Valid Until</div>
            <div className="font-semibold">Dec 2024</div>
          </div>
          <div className="text-sm opacity-90">ID: {user?.id || "12345"}</div>
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
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-4">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-500 bg-red-50 rounded-xl">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
