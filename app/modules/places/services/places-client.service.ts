import type { PlaceDetails, PlacesListParams, PlacesListResponse } from '../types/place.types';

function normalizeBaseUrl(value?: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    return '/api';
  }

  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

class PlacesClientService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = normalizeBaseUrl(baseUrl || process.env.NEXT_PUBLIC_API_URL);
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') {
          query.set(key, String(value));
        }
      }
    }

    const queryString = query.toString();
    const suffix = queryString ? `?${queryString}` : '';

    if (this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')) {
      const url = new URL(`${this.baseUrl}${path}`);
      if (queryString) {
        url.search = queryString;
      }
      return url.toString();
    }

    return `${this.baseUrl}${path}${suffix}`;
  }

  private async request<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const response = await fetch(this.buildUrl(path, params), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  async listPlaces(params: PlacesListParams = {}): Promise<PlacesListResponse> {
    return this.request<PlacesListResponse>('/places', {
      category: params.category,
      search: params.search,
      latitude: params.latitude,
      longitude: params.longitude,
      radiusKm: params.radiusKm,
      limit: params.limit,
      offset: params.offset,
    });
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    return this.request<PlaceDetails>(`/places/${placeId}`);
  }
}

export const placesClient = new PlacesClientService();
