import type { ServerUser } from '@/app/types/telegram';

export interface AuthValidationResult {
  valid: boolean;
  user: ServerUser | null;
  error?: string;
  status?: number;
  code?: string;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  responseBody?: string;
  apiError?: boolean;
  cause?: unknown;
}
