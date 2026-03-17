import { authClient } from '@/app/modules/auth/services/auth-client.service';
import type {
  FavoriteIdsResponse,
  FavoritePlacesResponse,
  FavoriteStatusResponse,
} from '../types/favorite.types';

class FavoritesClientService {
  private buildQuery(params: { limit?: number; offset?: number }): string {
    const query = new URLSearchParams();

    if (params.limit !== undefined) {
      query.set('limit', String(params.limit));
    }

    if (params.offset !== undefined) {
      query.set('offset', String(params.offset));
    }

    const serialized = query.toString();
    return serialized ? `?${serialized}` : '';
  }

  async listFavorites(params: { limit?: number; offset?: number } = {}): Promise<FavoritePlacesResponse> {
    return authClient.requestWithAuth<FavoritePlacesResponse>(`/favorites${this.buildQuery(params)}`, {
      method: 'GET',
    });
  }

  async listFavoriteIds(): Promise<FavoriteIdsResponse> {
    return authClient.requestWithAuth<FavoriteIdsResponse>('/favorites/ids', {
      method: 'GET',
    });
  }

  async getFavoriteStatus(placeId: string): Promise<FavoriteStatusResponse> {
    return authClient.requestWithAuth<FavoriteStatusResponse>(
      `/favorites/${encodeURIComponent(placeId)}/status`,
      {
        method: 'GET',
      }
    );
  }

  async addFavorite(placeId: string): Promise<FavoriteStatusResponse> {
    return authClient.requestWithAuth<FavoriteStatusResponse>(`/favorites/${encodeURIComponent(placeId)}`, {
      method: 'POST',
    });
  }

  async removeFavorite(placeId: string): Promise<FavoriteStatusResponse> {
    return authClient.requestWithAuth<FavoriteStatusResponse>(`/favorites/${encodeURIComponent(placeId)}`, {
      method: 'DELETE',
    });
  }
}

export const favoritesClient = new FavoritesClientService();
