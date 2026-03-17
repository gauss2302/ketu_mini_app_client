"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Clock, Star, Heart } from "lucide-react";
import { useTelegram } from "@/app/components/providers/telegram-provider";
import { favoritesClient } from "@/app/modules/favorites/services/favorites-client.service";
import { placesClient } from "@/app/modules/places/services/places-client.service";
import type { PlaceCategory, PlaceDetails as PlaceDetailsData } from "@/app/modules/places/types/place.types";
import { LoadingIndicator, SkeletonBlock } from "@/app/components/ui/loading-indicator";
import { RestaurantMenu } from "@/app/components/menu/restaurant-menu";

const numberFormatter = new Intl.NumberFormat("en-US");

interface PlaceDetailsProps {
  placeId: string;
}

function formatCategory(category: PlaceCategory): string {
  switch (category) {
    case "restaurant":
      return "Restaurant";
    case "bar":
      return "Bar";
    case "cafe":
      return "Cafe";
    case "club":
      return "Club";
    default:
      return category;
  }
}

export const PlaceDetails = ({ placeId }: PlaceDetailsProps) => {
  const router = useRouter();
  const { user } = useTelegram();
  const userId = user?.id;
  const [place, setPlace] = React.useState<PlaceDetailsData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0);
  const [isFavorite, setIsFavorite] = React.useState<boolean>(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await placesClient.getPlaceDetails(placeId);
        if (!cancelled) {
          setPlace(data);
          setActiveImageIndex(0);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : "Failed to load place";
          setError(message);
          setPlace(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [placeId]);

  React.useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setIsFavorite(false);
      return;
    }

    const loadFavoriteStatus = async () => {
      try {
        const status = await favoritesClient.getFavoriteStatus(placeId);
        if (!cancelled) {
          setIsFavorite(status.isFavorite);
        }
      } catch (statusError) {
        if (!cancelled) {
          console.error("[Favorites] Failed to load favorite status", statusError);
        }
      }
    };

    loadFavoriteStatus();

    return () => {
      cancelled = true;
    };
  }, [placeId, userId]);

  const toggleFavorite = React.useCallback(async () => {
    if (!userId || isFavoriteLoading) {
      return;
    }

    const wasFavorite = isFavorite;
    setIsFavorite(!wasFavorite);
    setIsFavoriteLoading(true);

    try {
      if (wasFavorite) {
        await favoritesClient.removeFavorite(placeId);
      } else {
        await favoritesClient.addFavorite(placeId);
      }
    } catch (toggleError) {
      setIsFavorite(wasFavorite);
      console.error("[Favorites] Failed to toggle favorite", toggleError);
    } finally {
      setIsFavoriteLoading(false);
    }
  }, [isFavorite, isFavoriteLoading, placeId, userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen theme-shell">
        <SkeletonBlock className="h-80 rounded-none" />
        <div className="p-4 space-y-4">
          <LoadingIndicator label="Loading place details..." />
          <SkeletonBlock className="h-6 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-20" />
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-7 w-24 rounded-full" />
            <SkeletonBlock className="h-7 w-20 rounded-full" />
            <SkeletonBlock className="h-7 w-28 rounded-full" />
            <SkeletonBlock className="h-7 w-16 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen theme-shell p-4">
        <div className="theme-danger-card rounded-2xl px-4 py-3 text-sm">
          Failed to load place: {error}
        </div>
      </div>
    );
  }

  if (!place) {
    return <div className="min-h-screen theme-shell p-4 text-sm theme-muted">Place not found.</div>;
  }

  const activeImage = place.images[activeImageIndex] || null;

  return (
    <div className="min-h-screen theme-shell">
      <div className="relative h-80">
        <div className="relative w-full h-full overflow-hidden">
          {activeImage ? (
            <Image
              src={activeImage.fullImageUrl}
              alt={place.name}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="theme-soft-card h-full w-full rounded-none" />
          )}

          <button
            onClick={() => router.back()}
            className="theme-overlay-button absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            type="button"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => {
              void toggleFavorite();
            }}
            disabled={!userId || isFavoriteLoading}
            className="theme-overlay-button absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            type="button"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? "text-[#FF7352] fill-current" : "text-white"}`} />
          </button>

          <div className="absolute bottom-4 right-4 flex space-x-2">
            {place.images.map((image, index) => (
              <button
                key={image.imageId}
                onClick={() => setActiveImageIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === activeImageIndex ? "bg-[#FF7352]" : "bg-white/50"
                }`}
                type="button"
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/20" />

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h1 className="text-2xl font-bold mb-2">{place.name}</h1>
            <div className="flex items-center text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium">{place.rating.toFixed(1)}</span>
                <span className="opacity-90 ml-1">({numberFormatter.format(place.reviewCount)} reviews)</span>
              </div>
              <div className="mx-2 opacity-60">•</div>
              <span className="opacity-90">{formatCategory(place.category)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6">
        <div className="theme-card mb-6 rounded-[28px] p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="theme-chip rounded-full px-3 py-1 text-xs font-medium">
              {formatCategory(place.category)}
            </span>
            <span className="theme-chip rounded-full px-3 py-1 text-xs font-medium">
              {place.distance}
            </span>
            <span className="theme-chip rounded-full px-3 py-1 text-xs font-medium">
              {place.priceRange}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center theme-muted">
              <MapPin className="w-5 h-5 mr-3" />
              <span>{place.location}</span>
            </div>
            <div className="flex items-center theme-muted">
              <Clock className="w-5 h-5 mr-3" />
              <span>{place.workingHours}</span>
            </div>
          </div>
        </div>

        <div className="theme-card mb-6 rounded-[28px] p-4">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="theme-muted leading-7">{place.description}</p>
        </div>

        <div className="theme-card mb-6 rounded-[28px] p-4">
          <h2 className="font-semibold mb-3">Features</h2>
          <div className="flex flex-wrap gap-2">
            {place.features.map((feature) => (
              <span
                key={feature}
                className="px-3 py-1 rounded-full text-sm theme-chip"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-2 px-1">Menu</h2>
          <RestaurantMenu categories={place.menu} />
        </div>
      </div>
    </div>
  );
};
