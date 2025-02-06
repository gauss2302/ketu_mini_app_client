// src/components/saved-places.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Star, MapPin } from "lucide-react";
import { savedPlaces } from "@/data/mock-places";

export const SavedPlacesPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold mb-2">Saved Places</h1>
        <p className="text-gray-500">{savedPlaces.length} places saved</p>
      </div>

      {/* Places List */}
      <div className="mt-2">
        {savedPlaces.map((place) => (
          <div
            key={place.id}
            onClick={() => router.push(`/places/${place.id}`)}
            className="bg-white mb-2 active:bg-gray-50"
          >
            <div className="flex p-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={place.images[0]}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{place.name}</h3>
                    <p className="text-gray-500 text-sm">{place.type}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{place.rating}</span>
                    <span className="text-gray-500 ml-1">
                      ({place.reviewCount.toLocaleString()})
                    </span>
                  </div>
                  <div className="mx-2 text-gray-300">•</div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {place.distance}
                  </div>
                  <div className="mx-2 text-gray-300">•</div>
                  <div className="text-gray-500 text-sm">
                    {place.priceRange}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
