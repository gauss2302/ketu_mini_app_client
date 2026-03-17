"use client";

import React from "react";
import {
  ArrowRight,
  Heart,
  MapPin,
  Menu,
  RefreshCw,
  Search,
  Settings,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTelegram } from "@/app/components/providers/telegram-provider";
import { LoadingIndicator, SkeletonBlock } from "@/app/components/ui/loading-indicator";
import { useTelegramLocation } from "@/app/hooks/use-telegram-location";
import { favoritesClient } from "@/app/modules/favorites/services/favorites-client.service";
import { placesClient } from "@/app/modules/places/services/places-client.service";
import type { PlaceCategory, PlaceSummary } from "@/app/modules/places/types/place.types";

const numberFormatter = new Intl.NumberFormat("en-US");
const RECENT_SEARCHES_KEY = "ketu-recent-searches";
const SEARCH_DEBOUNCE_MS = 350;
const BROWSE_LIMIT = 30;
const SEARCH_LIMIT = 20;
const NEARBY_LIMIT = 6;
const DEFAULT_NEARBY_RADIUS_KM = 1;
const MIN_NEARBY_RADIUS_KM = 0.5;
const MAX_NEARBY_RADIUS_KM = 10;
const NEARBY_RADIUS_STEP_KM = 0.5;

function formatCategory(category: PlaceCategory): string {
  switch (category) {
    case "restaurant":
      return "Ресторан";
    case "bar":
      return "Бар";
    case "cafe":
      return "Кафе";
    case "club":
      return "Клуб";
    default:
      return category;
  }
}

function formatRadiusKm(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatAccuracyMeters(value: number | null): string | null {
  if (value === null) {
    return null;
  }

  if (value < 1000) {
    return `Точность ${Math.round(value)} м`;
  }

  return `Точность ${value.toFixed(1)} км`;
}

function readRecentSearches(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string").slice(0, 6);
  } catch {
    return [];
  }
}

function writeRecentSearches(values: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(values));
}

export default function Home() {
  const { isReady, user } = useTelegram();
  const userId = user?.id;
  const {
    coordinates,
    error: locationError,
    isLoading: isRequestingLocation,
    canOpenSettings,
    requestLocation,
    openSettings,
  } = useTelegramLocation();

  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [browsePlaces, setBrowsePlaces] = React.useState<PlaceSummary[]>([]);
  const [searchResults, setSearchResults] = React.useState<PlaceSummary[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = React.useState<PlaceSummary[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = React.useState<boolean>(true);
  const [isSearching, setIsSearching] = React.useState<boolean>(false);
  const [isLoadingNearby, setIsLoadingNearby] = React.useState<boolean>(false);
  const [placesError, setPlacesError] = React.useState<string | null>(null);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [nearbyError, setNearbyError] = React.useState<string | null>(null);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = React.useState<Set<string>>(new Set());
  const [favoritePendingIds, setFavoritePendingIds] = React.useState<Set<string>>(new Set());
  const [hasRequestedNearby, setHasRequestedNearby] = React.useState(false);
  const [nearbyRadiusKm, setNearbyRadiusKm] = React.useState<number>(DEFAULT_NEARBY_RADIUS_KM);

  const activeSearchQuery = searchValue.trim();
  const isSearchActive = activeSearchQuery.length >= 1;
  const accuracyLabel = formatAccuracyMeters(coordinates?.accuracyMeters ?? null);
  const nearbyStatusError = nearbyError || locationError;

  const categories: Array<{ id: string; name: string }> = [
    { id: "all", name: "Все места" },
    { id: "restaurant", name: "Рестораны" },
    { id: "bar", name: "Бары" },
    { id: "cafe", name: "Кафе" },
    { id: "club", name: "Клубы" },
  ];

  React.useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  React.useEffect(() => {
    let isCancelled = false;

    const loadBrowsePlaces = async () => {
      try {
        setIsLoadingPlaces(true);
        setPlacesError(null);

        const category = selectedCategory === "all" ? undefined : (selectedCategory as PlaceCategory);
        const result = await placesClient.listPlaces({
          category,
          limit: BROWSE_LIMIT,
          offset: 0,
        });

        if (!isCancelled) {
          setBrowsePlaces(result.items);
        }
      } catch (error) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Не удалось загрузить места";
          setPlacesError(message);
          setBrowsePlaces([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPlaces(false);
        }
      }
    };

    loadBrowsePlaces();

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory]);

  React.useEffect(() => {
    let isCancelled = false;

    if (!isSearchActive) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);

        const category = selectedCategory === "all" ? undefined : (selectedCategory as PlaceCategory);
        const result = await placesClient.listPlaces({
          category,
          search: activeSearchQuery,
          limit: SEARCH_LIMIT,
          offset: 0,
        });

        if (!isCancelled) {
          setSearchResults(result.items);
        }
      } catch (error) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Ошибка поиска";
          setSearchError(message);
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeSearchQuery, isSearchActive, selectedCategory]);

  React.useEffect(() => {
    let isCancelled = false;

    if (!hasRequestedNearby || !coordinates) {
      setNearbyPlaces([]);
      setNearbyError(null);
      setIsLoadingNearby(false);
      return;
    }

    const loadNearbyPlaces = async () => {
      try {
        setIsLoadingNearby(true);
        setNearbyError(null);

        const result = await placesClient.listPlaces({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radiusKm: nearbyRadiusKm,
          limit: NEARBY_LIMIT,
          offset: 0,
        });

        if (!isCancelled) {
          setNearbyPlaces(result.items);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error ? error.message : "Не удалось загрузить места рядом";
          setNearbyError(message);
          setNearbyPlaces([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingNearby(false);
        }
      }
    };

    void loadNearbyPlaces();

    return () => {
      isCancelled = true;
    };
  }, [coordinates, hasRequestedNearby, nearbyRadiusKm]);

  React.useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setFavoriteIds(new Set());
      return;
    }

    const loadFavorites = async () => {
      try {
        const result = await favoritesClient.listFavoriteIds();
        if (!cancelled) {
          setFavoriteIds(new Set(result.items));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[Favorites] Failed to load favorite IDs", error);
        }
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveRecentSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    setRecentSearches((currentValues) => {
      const nextValues = [
        trimmedQuery,
        ...currentValues.filter((value) => value.toLowerCase() !== trimmedQuery.toLowerCase()),
      ].slice(0, 6);

      writeRecentSearches(nextValues);
      return nextValues;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    writeRecentSearches([]);
  };

  const toggleFavorite = async (placeId: string) => {
    if (!userId || favoritePendingIds.has(placeId)) {
      return;
    }

    const wasFavorite = favoriteIds.has(placeId);

    setFavoritePendingIds((currentValues) => {
      const nextValues = new Set(currentValues);
      nextValues.add(placeId);
      return nextValues;
    });

    setFavoriteIds((currentValues) => {
      const nextValues = new Set(currentValues);
      if (wasFavorite) {
        nextValues.delete(placeId);
      } else {
        nextValues.add(placeId);
      }
      return nextValues;
    });

    try {
      if (wasFavorite) {
        await favoritesClient.removeFavorite(placeId);
      } else {
        await favoritesClient.addFavorite(placeId);
      }
    } catch (error) {
      setFavoriteIds((currentValues) => {
        const nextValues = new Set(currentValues);
        if (wasFavorite) {
          nextValues.add(placeId);
        } else {
          nextValues.delete(placeId);
        }
        return nextValues;
      });
      console.error("[Favorites] Failed to toggle favorite", error);
    } finally {
      setFavoritePendingIds((currentValues) => {
        const nextValues = new Set(currentValues);
        nextValues.delete(placeId);
        return nextValues;
      });
    }
  };

  const requestNearbyPlaces = async () => {
    setHasRequestedNearby(true);
    setNearbyError(null);
    await requestLocation();
  };

  const popularPlaces = browsePlaces.slice(0, 2);
  const trendingPlaces = browsePlaces.slice(2);

  return (
    <div className="fixed inset-0 flex flex-col theme-shell">
      <header className="theme-panel z-10 flex-none rounded-b-[32px] border-x-0 border-t-0 px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="mb-1 text-sm theme-muted">Исследовать</div>
            <h1 className="text-2xl font-bold">Ташкент</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="theme-chip flex items-center space-x-1 rounded-full px-3 py-1.5 text-sm" type="button">
              <MapPin className="w-4 h-4 text-[#FF7352]" />
              <span>
                Ташкент
                {user && (
                  <span className="ml-1 text-[#FF7352]">• {user.firstName}</span>
                )}
              </span>
              {coordinates && (
                <span className="text-xs theme-muted">
                  {formatRadiusKm(nearbyRadiusKm)} км
                </span>
              )}
            </button>
            <button className="theme-chip rounded-full p-2 transition hover:scale-105" type="button">
              <Menu className="w-5 h-5 theme-muted" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 theme-muted" />
          <input
            type="text"
            placeholder="Поиск по названию, описанию, адресу и особенностям..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                saveRecentSearch(searchValue);
              }
            }}
            className="theme-input w-full rounded-2xl py-3 pl-12 pr-12"
          />
          {searchValue.length > 0 && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full theme-muted transition hover:bg-black/[0.04] hover:text-[var(--app-text)] dark:hover:bg-white/[0.04]"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex space-x-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`${
                selectedCategory === category.id
                  ? "theme-accent-pill"
                  : "theme-chip hover:border-[var(--app-border-strong)]"
              } rounded-full px-4 py-2 whitespace-nowrap font-medium transition-colors`}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4">
        <div className="py-4">
          {isReady && user && (
            <div className="theme-info-card mb-6 rounded-[24px] p-4">
              <h3 className="mb-2 font-semibold">
                Добро пожаловать, {user.firstName}!
              </h3>
              <div className="space-y-1 text-sm">
                <p>ID пользователя: {user.id}</p>
                {user.username && <p>Username: @{user.username}</p>}
                {user.languageCode && <p>Язык: {user.languageCode}</p>}
              </div>
            </div>
          )}

          {!isSearchActive && recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Недавние запросы</h2>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm theme-muted transition hover:text-[var(--app-text)]"
                  type="button"
                >
                  Очистить
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query) => (
                  <button
                    key={query}
                    onClick={() => {
                      setSearchValue(query);
                      saveRecentSearch(query);
                    }}
                    className="theme-chip rounded-full px-3 py-2 text-sm transition hover:border-[var(--app-border-strong)]"
                    type="button"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSearchActive && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Результаты поиска</h2>
                  <p className="text-sm theme-muted">
                    По запросу «{activeSearchQuery}»
                  </p>
                </div>
                <button
                  onClick={() => saveRecentSearch(activeSearchQuery)}
                  className="text-sm text-[#FF7352] font-medium"
                  type="button"
                >
                  Сохранить
                </button>
              </div>

              {isSearching && (
                <div className="mb-4">
                  <LoadingIndicator label="Ищем подходящие места..." />
                </div>
              )}

              {searchError && (
                <div className="theme-danger-card mb-4 rounded-2xl px-4 py-3 text-sm">
                  Ошибка поиска: {searchError}
                </div>
              )}

              {!isSearching && !searchError && searchResults.length === 0 && (
                <div className="theme-soft-card mb-4 rounded-2xl p-4 text-sm theme-muted">
                  Ничего не найдено. Попробуйте другой запрос.
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-4">
                  {searchResults.map((place) => (
                    <Link
                      href={`/places/${place.id}`}
                      key={`search-${place.id}`}
                      onClick={() => saveRecentSearch(activeSearchQuery)}
                      className="theme-card relative flex items-start gap-4 rounded-[28px] p-4 pr-14 transition hover:-translate-y-0.5"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <Image
                          src={place.previewImageUrl || "/club.jpg"}
                          alt={place.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{place.name}</h3>
                        <p className="text-sm theme-muted">
                          {formatCategory(place.category)} • {place.location}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm theme-muted">
                          {place.description}
                        </p>
                        <div className="flex items-center mt-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1">
                            {place.rating.toFixed(1)} ({numberFormatter.format(place.reviewCount)})
                          </span>
                          <span className="mx-2 theme-muted opacity-40">•</span>
                          <span className="theme-muted">{place.distance}</span>
                        </div>
                      </div>
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void toggleFavorite(place.id);
                        }}
                        disabled={favoritePendingIds.has(place.id)}
                        className="theme-chip absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full"
                        type="button"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favoriteIds.has(place.id)
                              ? "text-[#FF7352] fill-current"
                              : "theme-muted"
                          }`}
                        />
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <section className="theme-card relative mb-8 overflow-hidden rounded-[30px] p-5">
            <div className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rounded-full bg-[#FF7352]/15 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-10 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="theme-chip mb-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                  Рядом с вами
                </div>
                <h2 className="text-xl font-semibold">
                  Ищем места вокруг вашей геопозиции
                </h2>
                <p className="mt-2 max-w-xl text-sm theme-muted">
                  Telegram передаст текущую точку, а мы покажем ближайшие места в выбранном радиусе.
                </p>
              </div>

              <button
                onClick={() => void requestNearbyPlaces()}
                disabled={isRequestingLocation}
                className="theme-accent-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                {coordinates ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Обновить
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Рядом со мной
                  </>
                )}
              </button>
            </div>

            {coordinates && (
              <div className="theme-soft-card mt-4 rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">
                      Радиус поиска: {formatRadiusKm(nearbyRadiusKm)} км
                    </div>
                    <div className="text-xs theme-muted">
                      {accuracyLabel || "Точность Telegram не указана"}
                    </div>
                  </div>
                  <div className="theme-chip rounded-full px-3 py-1 text-xs font-medium">
                    До {formatRadiusKm(nearbyRadiusKm)} км
                  </div>
                </div>

                <input
                  type="range"
                  min={MIN_NEARBY_RADIUS_KM}
                  max={MAX_NEARBY_RADIUS_KM}
                  step={NEARBY_RADIUS_STEP_KM}
                  value={nearbyRadiusKm}
                  onChange={(event) => setNearbyRadiusKm(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--app-chip)] accent-[#FF7352]"
                />

                <div className="mt-2 flex justify-between text-xs theme-muted">
                  <span>{formatRadiusKm(MIN_NEARBY_RADIUS_KM)} км</span>
                  <span>{formatRadiusKm(MAX_NEARBY_RADIUS_KM)} км</span>
                </div>
              </div>
            )}

            {!hasRequestedNearby && !coordinates && !isRequestingLocation && (
              <div className="theme-soft-card mt-4 rounded-2xl p-4 text-sm theme-muted">
                Нажмите «Рядом со мной», чтобы включить nearby-поиск по текущей геолокации Telegram.
              </div>
            )}

            {isRequestingLocation && (
              <div className="theme-soft-card mt-4 rounded-2xl p-4">
                <LoadingIndicator compact label="Запрашиваем геолокацию в Telegram..." />
              </div>
            )}

            {!isRequestingLocation && nearbyStatusError && (
              <div className="theme-danger-card mt-4 rounded-2xl p-4">
                <div className="text-sm font-medium">
                  {nearbyStatusError}
                </div>
                {canOpenSettings && (
                  <button
                    onClick={openSettings}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                    type="button"
                  >
                    <Settings className="h-4 w-4" />
                    Открыть настройки
                  </button>
                )}
              </div>
            )}

            {!isRequestingLocation && coordinates && isLoadingNearby && (
              <div className="theme-soft-card mt-4 rounded-2xl p-4">
                <LoadingIndicator compact label="Подбираем ближайшие места..." />
              </div>
            )}

            {!isRequestingLocation &&
              coordinates &&
              !isLoadingNearby &&
              !nearbyStatusError &&
              nearbyPlaces.length === 0 && (
                <div className="theme-soft-card mt-4 rounded-2xl p-4 text-sm theme-muted">
                  В радиусе {formatRadiusKm(nearbyRadiusKm)} км ничего не найдено. Увеличьте расстояние ползунком.
                </div>
              )}

            {!isRequestingLocation &&
              coordinates &&
              !isLoadingNearby &&
              nearbyPlaces.length > 0 && (
                <div className="mt-4 space-y-3">
                  {nearbyPlaces.map((place) => (
                    <Link
                      href={`/places/${place.id}`}
                      key={`nearby-${place.id}`}
                      className="theme-soft-card relative flex items-center gap-4 rounded-[24px] p-4 pr-14 transition hover:-translate-y-0.5"
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-2xl flex-shrink-0">
                        <Image
                          src={place.previewImageUrl || "/club.jpg"}
                          alt={place.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold">
                            {place.name}
                          </h3>
                          <span className="theme-chip rounded-full px-2 py-0.5 text-[11px] font-medium">
                            {place.distance}
                          </span>
                        </div>
                        <p className="mt-1 text-sm theme-muted">
                          {formatCategory(place.category)} • {place.location}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                          <span>
                            {place.rating.toFixed(1)} ({numberFormatter.format(place.reviewCount)})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void toggleFavorite(place.id);
                        }}
                        disabled={favoritePendingIds.has(place.id)}
                        className="theme-chip absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full"
                        type="button"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favoriteIds.has(place.id)
                              ? "text-[#FF7352] fill-current"
                              : "theme-muted"
                          }`}
                        />
                      </button>
                    </Link>
                  ))}
                </div>
              )}
          </section>

          {isLoadingPlaces && (
            <div className="mb-6 space-y-5">
              <LoadingIndicator label="Загружаем каталог мест..." />
              <div className="grid grid-cols-2 gap-4">
                <SkeletonBlock className="h-48 rounded-2xl" />
                <SkeletonBlock className="h-48 rounded-2xl" />
              </div>
              <div className="space-y-3">
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
                <SkeletonBlock className="h-24" />
              </div>
            </div>
          )}

          {placesError && (
            <div className="theme-danger-card mb-6 rounded-2xl px-4 py-3 text-sm">
              Не удалось загрузить места: {placesError}
            </div>
          )}

          {!isLoadingPlaces && !placesError && browsePlaces.length === 0 && (
            <div className="theme-soft-card mb-6 rounded-2xl px-4 py-4 text-sm theme-muted">
              Места не найдены.
            </div>
          )}

          {!isLoadingPlaces && popularPlaces.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Популярное</h2>
                <button className="flex items-center text-sm font-medium text-[#FF7352]" type="button">
                  Смотреть все
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {popularPlaces.map((place) => (
                  <Link
                    href={`/places/${place.id}`}
                    key={place.id}
                    className="relative rounded-2xl overflow-hidden"
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={place.previewImageUrl || "/club.jpg"}
                        alt={place.name}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void toggleFavorite(place.id);
                      }}
                      disabled={favoritePendingIds.has(place.id)}
                      className="theme-overlay-button absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full"
                      type="button"
                    >
                      <Heart
                        className={`w-5 h-5 ${favoriteIds.has(place.id) ? "text-[#FF7352] fill-current" : "text-white"}`}
                      />
                    </button>
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="font-medium mb-1">{place.name}</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm ml-1">{place.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm opacity-75">• {formatCategory(place.category)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!isLoadingPlaces && trendingPlaces.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Сейчас в тренде</h2>
                <button className="flex items-center text-sm font-medium text-[#FF7352]" type="button">
                  Смотреть все
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4 pb-4">
                {trendingPlaces.map((place) => (
                  <Link
                    href={`/places/${place.id}`}
                    key={place.id}
                    className="theme-card relative flex items-center space-x-4 rounded-[24px] p-4 pr-14 transition hover:-translate-y-0.5"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={place.previewImageUrl || "/club.jpg"}
                        alt={place.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="mb-1 font-medium">{place.name}</h3>
                      <p className="text-sm theme-muted">
                        {formatCategory(place.category)} • {place.distance}
                      </p>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-[#F3E038] fill-current" />
                        <span className="ml-1 text-sm">
                          {place.rating.toFixed(1)} ({numberFormatter.format(place.reviewCount)} отзывов)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void toggleFavorite(place.id);
                      }}
                      disabled={favoritePendingIds.has(place.id)}
                      className="theme-chip absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full"
                      type="button"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favoriteIds.has(place.id)
                            ? "text-[#FF7352] fill-current"
                            : "theme-muted"
                        }`}
                      />
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {process.env.NODE_ENV === "development" && isReady && (
            <div className="theme-soft-card mt-8 rounded-xl p-4">
              <h3 className="mb-2 font-semibold">Debug Info</h3>
              <div className="space-y-1 text-sm theme-muted">
                <p>
                  <strong>Ready:</strong> {isReady ? "Да" : "Нет"}
                </p>
                <p>
                  <strong>Browse places:</strong> {browsePlaces.length}
                </p>
                <p>
                  <strong>Search results:</strong> {searchResults.length}
                </p>
                <p>
                  <strong>Nearby places:</strong> {nearbyPlaces.length}
                </p>
                <p>
                  <strong>Has location:</strong> {coordinates ? "Да" : "Нет"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="theme-panel flex-none border-b-0 border-x-0 rounded-none py-2" />
    </div>
  );
}
