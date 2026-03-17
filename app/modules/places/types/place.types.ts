export type PlaceCategory = 'restaurant' | 'bar' | 'cafe' | 'club';

export interface PlaceSummary {
  id: string;
  name: string;
  category: PlaceCategory;
  rating: number;
  reviewCount: number;
  distance: string;
  distanceKm: number | null;
  priceRange: string;
  description: string;
  location: string;
  workingHours: string;
  features: string[];
  previewImageUrl: string | null;
}

export interface PlaceDetails {
  id: string;
  name: string;
  category: PlaceCategory;
  rating: number;
  reviewCount: number;
  distance: string;
  distanceKm: number | null;
  priceRange: string;
  description: string;
  location: string;
  workingHours: string;
  features: string[];
  images: Array<{
    imageId: number;
    previewImageUrl: string;
    fullImageUrl: string;
  }>;
  menu: MenuCategory[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  currency: "UZS";
  sortOrder: number;
  isPopular: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  isAvailable: boolean;
  previewImageUrl: string | null;
  fullImageUrl: string | null;
}

export interface PlacesListResponse {
  items: PlaceSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface PlacesListParams {
  category?: PlaceCategory;
  search?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
}
