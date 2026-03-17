import type { AuthResponse } from '@/app/types/telegram';
import type { ApiError, AuthValidationResult } from '../types/auth.types';
import {
  normalizeInitData,
  normalizeNetworkAuthError,
  safeJson,
} from '../utils/init-data.util';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function normalizeBaseUrl(value?: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    return '/api';
  }

  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

class AuthClientService {
  private static instance: AuthClientService;
  private readonly baseUrl: string;
  private accessToken: string | null = null;
  private initDataRaw: string | null = null;

  private constructor(baseUrl?: string) {
    this.baseUrl = normalizeBaseUrl(baseUrl || process.env.NEXT_PUBLIC_API_URL);

    if (typeof window !== 'undefined') {
      if (this.baseUrl === '/api') {
        console.warn(
          '[API] NEXT_PUBLIC_API_URL is unset; using /api. Set it to your ketu_server URL (e.g. http://localhost:18080)'
        );
      }

      const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored) {
        this.accessToken = stored;
      }
    }
  }

  public static getInstance(baseUrl?: string): AuthClientService {
    if (!AuthClientService.instance) {
      AuthClientService.instance = new AuthClientService(baseUrl);
    }

    return AuthClientService.instance;
  }

  private getAuthHeaders(): Record<string, string> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  public async requestWithAuth<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const headers = {
        ...this.getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 && retryOnUnauthorized) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return this.requestWithAuth<T>(endpoint, options, false);
          }

          this.clearAuth();
        }

        const errorText = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json() as Promise<T>;
      }

      const textResponse = await response.text();
      return textResponse as T;
    } catch (error) {
      console.error(`[API] Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  public async validateAuth(initDataOverride?: string): Promise<AuthValidationResult> {
    const initData = initDataOverride || this.initDataRaw;

    if (!initData) {
      console.error('[API] No initData available for validation');
      return {
        valid: false,
        user: null,
        error: 'No initData available',
        code: 'NO_INIT_DATA',
      };
    }

    try {
      const normalizedInitData = normalizeInitData(initData);
      if (!normalizedInitData) {
        console.error('[API] initData format is unsupported', {
          length: initData.length,
          preview: initData.substring(0, 80),
        });

        return {
          valid: false,
          user: null,
          error: 'Unsupported initData format',
          code: 'INVALID_INIT_DATA_FORMAT',
        };
      }

      if (initDataOverride) {
        this.initDataRaw = normalizedInitData;
      }

      const url = `${this.baseUrl}/auth/telegram`;
      console.log(
        `[API] Authenticating with backend: ${safeJson({
          url,
          baseUrl: this.baseUrl,
          initDataLength: normalizedInitData.length,
          initDataPreview: `${normalizedInitData.substring(0, 100)}...`,
        })}`
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `tma ${normalizedInitData}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(
        `[API] Auth response status: ${safeJson({
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        })}`
      );

      if (!response.ok) {
        let errorText: string;
        let errorJson: unknown = null;

        try {
          errorText = await response.text();
          try {
            errorJson = JSON.parse(errorText);
          } catch {
            // not json
          }
        } catch (error) {
          errorText = `Failed to read error response: ${error instanceof Error ? error.message : String(error)}`;
        }

        const errorMessage =
          errorJson && typeof errorJson === 'object' && 'error' in errorJson
            ? String(errorJson.error)
            : errorText;

        const errorCode =
          errorJson && typeof errorJson === 'object' && 'code' in errorJson
            ? String(errorJson.code)
            : `HTTP_${response.status}`;

        console.error(
          `[API] Auth request failed: ${safeJson({
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            code: errorCode,
            body: errorText,
            url,
          })}`
        );

        const error = new Error(`Authentication failed: ${errorMessage}`) as ApiError;
        error.status = response.status;
        error.code = errorCode;
        error.responseBody = errorText;
        throw error;
      }

      const responseData = (await response.json()) as AuthResponse;
      console.log(
        `[API] Auth response received: ${safeJson({
          hasTokens: !!responseData.tokens,
          hasUser: !!responseData.user,
          userId: responseData.user?.id,
          message: responseData.message,
        })}`
      );

      if (responseData.tokens && responseData.tokens.accessToken) {
        this.accessToken = responseData.tokens.accessToken;

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(ACCESS_TOKEN_KEY, responseData.tokens.accessToken);
          if (responseData.tokens.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, responseData.tokens.refreshToken);
          }
        }

        return { valid: true, user: responseData.user };
      }

      console.warn(
        `[API] Auth response missing tokens: ${safeJson({
          hasTokens: !!responseData.tokens,
          hasAccessToken: !!responseData.tokens?.accessToken,
          responseKeys: Object.keys(responseData),
        })}`
      );

      return {
        valid: false,
        user: null,
        error: 'Auth response missing access token',
        code: 'INVALID_AUTH_RESPONSE',
      };
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      const apiError = error as ApiError;
      const status = apiError?.status;
      const code = apiError?.code;
      const responseBody = apiError?.responseBody;
      const errorName = error instanceof Error ? error.name : typeof error;
      const cause =
        error instanceof Error && 'cause' in error
          ? (error as { cause?: unknown }).cause
          : undefined;

      const normalizedNetworkError = normalizeNetworkAuthError(rawMessage, this.baseUrl);
      const normalizedCode = code || normalizedNetworkError.code;
      const normalizedMessage = normalizedNetworkError.message;

      const details = {
        errorName,
        error: normalizedMessage,
        status,
        code: normalizedCode,
        responseBody,
        cause,
        rawError: error,
        url: `${this.baseUrl}/auth/telegram`,
        hint: 'Check: NEXT_PUBLIC_API_URL is reachable, BOT_TOKEN matches mini app bot, app opened from Telegram',
      };
      console.error(`[API] Auth validation failed: ${safeJson(details)}`);

      if (error instanceof Error) {
        const extendedError = error as ApiError;
        extendedError.apiError = true;
        extendedError.status = status;
        extendedError.code = code;
      }

      return {
        valid: false,
        user: null,
        error: normalizedMessage,
        status,
        code: normalizedCode,
      };
    }
  }

  public async refreshToken(): Promise<boolean> {
    const refreshToken =
      typeof localStorage !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as {
        tokens?: { accessToken: string; refreshToken: string };
      };

      if (data.tokens?.accessToken && data.tokens?.refreshToken) {
        this.accessToken = data.tokens.accessToken;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(ACCESS_TOKEN_KEY, data.tokens.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
        }

        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  public async logout(): Promise<void> {
    const refreshToken =
      typeof localStorage !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

    try {
      if (refreshToken) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      this.clearAuth();
    }
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setInitDataRaw(initData: string | null): void {
    this.initDataRaw = initData;
  }

  public hasInitData(): boolean {
    return !!this.initDataRaw;
  }

  public getInitDataRaw(): string | null {
    return this.initDataRaw;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public clearAuth(): void {
    this.accessToken = null;
    this.initDataRaw = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

export const authClient = AuthClientService.getInstance();
