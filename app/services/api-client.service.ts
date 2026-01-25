import type { ServerUser, AuthResponse } from "@/app/types/telegram";

/**
 * Backend user type with additional database fields
 */
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

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * API Client for communicating with ketu_server backend
 * Handles Telegram Mini App authentication and API requests
 */
class APIClientService {
	private static instance: APIClientService;
	private readonly baseUrl: string;
	private accessToken: string | null = null;
	private initDataRaw: string | null = null;

	private constructor(baseUrl?: string) {
		// Use environment variable for backend URL (ketu_server)
		this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "/api";
		
		if (typeof window !== "undefined") {
			if (this.baseUrl === "/api") {
				console.warn(
					"[API] NEXT_PUBLIC_API_URL is unset; using /api. Set it to your ketu_server URL (e.g. http://localhost:18080)"
				);
			}
			// Restore token from localStorage
			const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
			if (stored) {
				this.accessToken = stored;
			}
		}
	}

	public static getInstance(baseURL?: string): APIClientService {
		if (!APIClientService.instance) {
			APIClientService.instance = new APIClientService(baseURL);
		}
		return APIClientService.instance;
	}

	private getAuthHeaders(): Record<string, string> {
		if (this.accessToken) {
			return {
				'Authorization': `Bearer ${this.accessToken}`,
				'Content-Type': 'application/json',
			};
		}

		if (!this.initDataRaw) {
			throw new Error("No Auth Token or TG Auth Data available");
		}

		// Fallback to sending initData directly per tma.js docs: "tma <initData>"
		return {
			'Authorization': `tma ${this.initDataRaw}`,
			'Content-Type': 'application/json',
		};
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

	public async get<T>(endpoint: string): Promise<T> {
		return this.request(endpoint, { method: 'GET' });
	}

	public async post<T>(endpoint: string, data?: unknown): Promise<T> {
		return this.request(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	/**
	 * Authenticate with backend using Telegram initData
	 * Follows tma.js documentation pattern: sends initData in Authorization header
	 * 
	 * @param initDataOverride - Optional initData to use instead of stored value
	 * @returns Authentication result with ServerUser (snake_case format from backend)
	 */
	public async validateAuth(initDataOverride?: string): Promise<{ valid: boolean; user: ServerUser | null }> {
		const initData = initDataOverride || this.initDataRaw;
		
		if (!initData) {
			console.error("[API] No initData available for validation");
			return { valid: false, user: null };
		}

		try {
			if (initDataOverride) {
				this.initDataRaw = initDataOverride;
			}
			
			console.log("[API] Authenticating with backend...", {
				url: `${this.baseUrl}/auth/telegram`,
				initDataLength: initData.length,
			});

			// Send initData in Authorization header per tma.js docs: "tma <initData>"
			// Also send in body for backwards compatibility
			const url = `${this.baseUrl}/auth/telegram`;
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': `tma ${initData}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ initData }),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("[API] Auth request failed:", {
					status: response.status,
					statusText: response.statusText,
					body: errorText,
				});
				throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
			}

			const responseData = await response.json() as AuthResponse;
			console.log("[API] Auth response received:", {
				hasTokens: !!responseData.tokens,
				hasUser: !!responseData.user,
				userId: responseData.user?.id,
			});

			if (responseData.tokens && responseData.tokens.accessToken) {
				this.accessToken = responseData.tokens.accessToken;
				
				if (typeof localStorage !== "undefined") {
					localStorage.setItem(ACCESS_TOKEN_KEY, responseData.tokens.accessToken);
					if (responseData.tokens.refreshToken) {
						localStorage.setItem(REFRESH_TOKEN_KEY, responseData.tokens.refreshToken);
					}
				}
				
				return { valid: true, user: responseData.user };
			}
			
			return { valid: false, user: null };
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			console.error("[API] Auth validation failed:", {
				error: msg,
				hint: "Check: NEXT_PUBLIC_API_URL is reachable, BOT_TOKEN matches mini app bot, app opened from Telegram",
			});
			return { valid: false, user: null };
		}
	}

	/**
	 * Refresh access token using refresh token
	 */
	public async refreshToken(): Promise<boolean> {
		const refreshToken = typeof localStorage !== "undefined" 
			? localStorage.getItem(REFRESH_TOKEN_KEY) 
			: null;
			
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

			const data = await response.json() as { accessToken: string };
			if (data.accessToken) {
				this.accessToken = data.accessToken;
				localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
				return true;
			}
			
			return false;
		} catch {
			return false;
		}
	}

	public async getUserProfile(): Promise<BackendUser> {
		return this.get('/user/profile');
	}

	public async updateUserSettings(settings: unknown): Promise<BackendUser> {
		return this.post('/user/settings', settings);
	}

	public setAccessToken(token: string): void {
		this.accessToken = token;
	}

	public setInitDataRaw(initData: string | null): void {
		this.initDataRaw = initData;
	}

	public getAccessToken(): string | null {
		return this.accessToken;
	}

	public hasInitData(): boolean {
		return !!this.initDataRaw;
	}

	public getInitDataRaw(): string | null {
		return this.initDataRaw;
	}

	/** Clear tokens from memory and localStorage */
	public clearAuth(): void {
		this.accessToken = null;
		this.initDataRaw = null;
		if (typeof localStorage !== "undefined") {
			localStorage.removeItem(ACCESS_TOKEN_KEY);
			localStorage.removeItem(REFRESH_TOKEN_KEY);
		}
	}
}

export const apiClient = APIClientService.getInstance();
