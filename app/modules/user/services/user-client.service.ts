import { authClient } from '@/app/modules/auth/services/auth-client.service';
import type { BackendUser } from '../types/user.types';

class UserClientService {
  public async getProfile(): Promise<BackendUser> {
    return authClient.requestWithAuth<BackendUser>('/user/profile', { method: 'GET' });
  }

  public async updateSettings(settings: Record<string, unknown>): Promise<BackendUser> {
    return authClient.requestWithAuth<BackendUser>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }
}

export const userClient = new UserClientService();
