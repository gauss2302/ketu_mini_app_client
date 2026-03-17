import type { PlacesListResponse } from '@/app/modules/places/types/place.types';

export interface FavoriteIdsResponse {
  items: string[];
}

export interface FavoriteStatusResponse {
  placeId: string;
  isFavorite: boolean;
}

export type FavoritePlacesResponse = PlacesListResponse;
