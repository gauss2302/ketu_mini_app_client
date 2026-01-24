import {User} from "@telegram-apps/sdk-react";

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

class APIClientService {
	private static instance: APIClientService;
	private readonly baseUrl: string;
	private accessToken: string | null = null;
	private initDataRaw: string | null = null;

	private constructor(baseUrl?: string) {
		// Use environment variable for backend URL, fallback to /api for Next.js routes
		this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "/api";
	}

	public static getInstance(baseURL?: string): APIClientService {
		if(!APIClientService.instance) {
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

		if(!this.initDataRaw) {
			// If we don't have a token AND we don't have initData, we can't authenticate.
			// However, for the initial validateAuth call, we might not need headers if we send initData in body.
			// But for other requests, we need auth.
			throw new Error("No Auth Token or TG Auth Data available");
		}

		// Fallback to sending initData directly if no token yet (though backend expects token for other endpoints usually)
		return {
			'Authorization': `tma ${this.initDataRaw}`,
			'Content-Type': 'application/json',
		}
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

			if(!response.ok) {
				throw new Error(`${response.status} ${response.statusText}`);
			}

			const contentType = response.headers.get('content-type');
			if(contentType && contentType.includes('application/json')) {
				return response.json() as Promise<T>;
			}

			const textResponse = await response.text();
			return textResponse as T;
		} catch (error) {
			console.error(`API request failed: ${endpoint}`, error);
			throw error;

		}
	}

	public async get<T>(endpoint: string): Promise<T> {
		return this.request(endpoint, {method: 'GET'});
	}

	public async post<T>(endpoint: string, data?: unknown): Promise<T> {
		return this.request(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	// Специфичные методы для Telegram Mini App
	public async validateAuth(initDataOverride?: string): Promise<{ valid: boolean; user: User | null }> {
		const initData = initDataOverride || this.initDataRaw;
		if (!initData) {
			console.error("No initData available for validation");
			return { valid: false, user: null };
		}

		try {
			if (initDataOverride) {
				this.initDataRaw = initDataOverride;
			}
			// Call Express backend auth endpoint
			const response = await this.post<{ 
				message: string; 
				tokens: { accessToken: string; refreshToken: string }; 
				user: User 
			}>('/auth/telegram', {
				initData,
			});

			if (response.tokens && response.tokens.accessToken) {
				this.accessToken = response.tokens.accessToken;
				// Store refresh token for future use. Note: localStorage can be cleared on
				// some Telegram WebViews (iOS, Linux Desktop). Prefer Init Data auth in
				// simple flows; we fall back to initData when no token.
				// @see https://habr.com/ru/companies/doubletapp/articles/917286/
				if (response.tokens.refreshToken && typeof localStorage !== "undefined") {
					localStorage.setItem("refreshToken", response.tokens.refreshToken);
				}
				return { valid: true, user: response.user };
			}
			
			return { valid: false, user: null };
		} catch (error) {
			console.error("Auth validation failed", error);
			return { valid: false, user: null };
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
}

export const apiClient = APIClientService.getInstance();
