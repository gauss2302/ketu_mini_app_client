"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Star, Heart } from "lucide-react";
import { savedPlaces } from "@/data/mock-places";
import { RestaurantMenu } from "./menu/restaurant-menu";

interface PlaceDetailsProps {
  placeId: string;
}

export const PlaceDetails = ({ placeId }: PlaceDetailsProps) => {
  const router = useRouter();
  const place = savedPlaces.find((p) => p.id === placeId);

  if (!place) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-80">
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={place.images[0]}
            alt={place.name}
            className="w-full h-full object-cover"
          />

          {/* Navigation Controls */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <Heart className="w-6 h-6 text-white fill-current" />
          </button>

          {/* Image Navigation Dots */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            {place.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === 0 ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/20"></div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h1 className="text-2xl font-bold mb-2">{place.name}</h1>
            <div className="flex items-center text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium">{place.rating}</span>
                <span className="opacity-90 ml-1">
                  ({place.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
              <div className="mx-2 opacity-60">•</div>
              <span className="opacity-90">{place.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-4 pt-4">
        {/* Info Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-3" />
            <span>{place.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-3" />
            <span>{place.workingHours}</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-gray-600">{place.description}</p>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Features</h2>
          <div className="flex flex-wrap gap-2">
            {place.features.map((feature, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Menu Section */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Menu</h2>
          {place.menu && place.menu.length > 0 ? (
            <RestaurantMenu categories={place.menu} />
          ) : (
            <p className="text-gray-500">Menu not available</p>
          )}
        </div>

        {/* Reviews */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Reviews</h2>
          <div className="space-y-4">
            {place.reviews.map((review, index) => (
              <div key={index} className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{review.author}</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{review.text}</p>
                <span className="text-gray-400 text-sm">{review.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
