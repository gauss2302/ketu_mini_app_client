"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Heart, Star, Menu, ArrowRight } from "lucide-react";
import Link from "next/link";
import { savedPlaces } from "@/data/mock-places";
import { useTelegram } from "@/app/hooks/use-telegram-webapp";

import { telegramSDK, TelegramSDKService } from "@/app/services/telegram-sdk.service";
import { User } from "@telegram-apps/sdk-react";
import { apiClient } from "../services/api-client.service";

const numberFormatter = new Intl.NumberFormat("en-US");

export default function Home() {
  const { isReady } = useTelegram();

  const [user, setUser] = useState<User | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = React.useState("all");

  interface Categories {
    id: string;
    name: string;
  }

  const categories: Categories[] = [
    { id: "all", name: "All Places" },
    { id: "restaurant", name: "Restaurants" },
    { id: "bar", name: "Bars" },
    { id: "cafe", name: "Cafes" },
    { id: "club", name: "Clubs" },
  ];

  const filteredPlaces = React.useMemo(() => {
    if (selectedCategory === "all") return savedPlaces;
    return savedPlaces.filter((place) =>
      place.type.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [selectedCategory]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await telegramSDK.initialize();
        const { user } = await apiClient.validateAuth();
        setUser(user);
        setDebugInfo(`Init data: ${telegramSDK.getInitDataRaw()}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log("Init failed:", error);
        setError(error.message || "Failed to initialize app");
      }
    };

    initializeApp();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header - Static */}
      <header className="flex-none bg-white z-10 border-b px-4 pt-6 pb-3">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Explore</div>
            <h1 className="text-2xl font-bold">Tashkent</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center text-sm text-gray-600 space-x-1 bg-gray-50 px-3 py-1.5 rounded-full">
              <MapPin className="w-4 h-4 text-[#FF7352]" />
              <span>
                Tashkent
                {user && (
                  <span className="ml-1 text-blue-600">
                    • {user.first_name}
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-400">2.5 km</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search places and bars..."
            className="w-full bg-gray-50 rounded-2xl py-3 pl-12 pr-4 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF7352]"
          />
        </div>

        {/* Categories - Static */}
        <div className="flex space-x-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${
                selectedCategory === category.id
                  ? "bg-[#FF7352] text-white"
                  : "bg-gray-100 text-gray-600"
              } px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto px-4">
        <div className="py-4">
          {/* User Info Section (если есть данные) */}
          {isReady && user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-2">
                Welcome, {user.first_name}!
              </h3>
              <div className="text-sm text-blue-600">
                <p>User ID: {user.id}</p>
                {user.username && <p>Username: @{user.username}</p>}
                {user.language_code && <p>Language: {user.language_code}</p>}
                {/* <p>User Agent: {user.auth}</p> */}
              </div>
              <h3>
                <Link
                  href="/test"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Test
                </Link>
              </h3>
            </div>
          )}

          {/* Popular Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Popular</h2>
              <button className="text-[#FF7352] text-sm font-medium flex items-center">
                See all
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredPlaces.slice(0, 2).map((place) => (
                <Link
                  href={`/places/${place.id}`}
                  key={place.id}
                  className="relative rounded-2xl overflow-hidden"
                >
                  <img
                    src={place.images[0]}
                    alt={place.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </button>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="font-medium mb-1">{place.name}</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm ml-1">{place.rating}</span>
                      </div>
                      <span className="text-sm opacity-75">• {place.type}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending Places */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Trending Now</h2>
              <button className="text-[#FF7352] text-sm font-medium flex items-center">
                See all
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4 pb-4">
              {filteredPlaces.slice(2).map((place) => (
                <Link
                  href={`/places/${place.id}`}
                  key={place.id}
                  className="bg-gray-50 p-4 rounded-xl flex items-center space-x-4"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={place.images[0]}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{place.name}</h3>
                    <p className="text-sm text-gray-500">
                      {place.type} • {place.distance}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-[#F3E038] fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {place.rating} (
                        {numberFormatter.format(place.reviewCount)} reviews)
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Debug Info (только в development) */}
          {process.env.NODE_ENV === "development" && isReady && (
            <div className="mt-8 p-4 bg-gray-100 rounded-xl">
              <h3 className="font-semibold mb-2">Debug Info</h3>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Ready:</strong> {isReady ? "Yes" : "No"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Navigation - Static */}
      <div className="flex-none border-t bg-white py-2">
        {/* Bottom Nav Content */}
      </div>
    </div>
  );
}
