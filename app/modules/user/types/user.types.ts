export interface BackendUser {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium: boolean;
  avatar_url?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
