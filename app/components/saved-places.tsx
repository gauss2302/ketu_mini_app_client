"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Star, MapPin, Heart } from "lucide-react";
import Image from "next/image";
import { useTelegram } from "@/app/components/providers/telegram-provider";
import { favoritesClient } from "@/app/modules/favorites/services/favorites-client.service";
import type { PlaceCategory, PlaceSummary } from "@/app/modules/places/types/place.types";
import { LoadingIndicator, SkeletonBlock } from "@/app/components/ui/loading-indicator";

const numberFormatter = new Intl.NumberFormat("en-US");

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

export const SavedPlacesPage = () => {
  const router = useRouter();
  const { user } = useTelegram();
  const userId = user?.id;
  const [places, setPlaces] = React.useState<PlaceSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingRemovalIds, setPendingRemovalIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setPlaces([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await favoritesClient.listFavorites({ limit: 50, offset: 0 });
        if (!cancelled) {
          setPlaces(result.items);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : "Failed to load places";
          setError(message);
          setPlaces([]);
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
  }, [userId]);

  const removeFromFavorites = React.useCallback(async (placeId: string) => {
    if (!userId || pendingRemovalIds.has(placeId)) {
      return;
    }

    setPendingRemovalIds((prev) => {
      const next = new Set(prev);
      next.add(placeId);
      return next;
    });

    const previous = places;
    setPlaces((prev) => prev.filter((place) => place.id !== placeId));

    try {
      await favoritesClient.removeFavorite(placeId);
    } catch (removeError) {
      setPlaces(previous);
      console.error("[Favorites] Failed to remove place from favorites", removeError);
    } finally {
      setPendingRemovalIds((prev) => {
        const next = new Set(prev);
        next.delete(placeId);
        return next;
      });
    }
  }, [pendingRemovalIds, places, userId]);

  return (
    <div className="min-h-screen theme-shell">
      <div className="theme-panel rounded-b-[32px] border-t-0 border-x-0 px-4 pt-6 pb-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] theme-muted">Collection</p>
            <h1 className="mt-2 text-2xl font-bold">Saved Places</h1>
            <p className="mt-2 theme-muted">{places.length} places saved</p>
          </div>
          <div className="theme-chip rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
            Favorites
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="px-4 py-4 space-y-3">
          <LoadingIndicator label="Preparing your saved places..." />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="theme-card rounded-2xl p-4">
              <div className="flex gap-4">
                <SkeletonBlock className="h-24 w-24 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-5 w-40" />
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="px-4 py-4">
          <div className="theme-danger-card rounded-2xl px-4 py-3 text-sm">
            Failed to load places: {error}
          </div>
        </div>
      )}
      {!userId && (
        <div className="px-4 py-4">
          <div className="theme-soft-card rounded-2xl px-4 py-4 text-sm theme-muted">
            Sign in to see saved places.
          </div>
        </div>
      )}
      {!isLoading && !error && places.length === 0 && (
        <div className="px-4 py-4">
          <div className="theme-soft-card rounded-2xl px-4 py-4 text-sm theme-muted">
            No places found.
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="mt-3 px-4 pb-4 space-y-3">
          {places.map((place) => (
            <div
              key={place.id}
              onClick={() => router.push(`/places/${place.id}`)}
              className="theme-card rounded-[28px] transition hover:-translate-y-0.5 active:opacity-90"
            >
              <div className="flex p-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={place.previewImageUrl || "/club.jpg"}
                    alt={place.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{place.name}</h3>
                      <p className="theme-muted text-sm">{formatCategory(place.category)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void removeFromFavorites(place.id);
                        }}
                        disabled={pendingRemovalIds.has(place.id)}
                        className="theme-danger-card flex h-8 w-8 items-center justify-center rounded-full transition hover:brightness-105"
                        type="button"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                      <ChevronRight className="w-5 h-5 theme-muted" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">{place.rating.toFixed(1)}</span>
                      <span className="theme-muted ml-1">({numberFormatter.format(place.reviewCount)})</span>
                    </div>
                    <div className="mx-2 theme-muted opacity-50">•</div>
                    <div className="flex items-center theme-muted text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {place.distance}
                    </div>
                    <div className="mx-2 theme-muted opacity-50">•</div>
                    <div className="theme-muted text-sm">{place.priceRange}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
