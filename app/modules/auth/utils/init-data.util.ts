import { serializeInitDataQuery } from '@telegram-apps/sdk';

export function safeJson(value: unknown): string {
  try {
    return JSON.stringify(
      value,
      (_key, v) => {
        if (v instanceof Error) {
          return {
            name: v.name,
            message: v.message,
            stack: v.stack,
          };
        }

        return v;
      },
      2
    );
  } catch {
    return String(value);
  }
}

function isLikelyNetworkErrorMessage(message: string): boolean {
  const text = message.toLowerCase();
  return (
    text.includes('load failed') ||
    text.includes('failed to fetch') ||
    text.includes('network request failed') ||
    text.includes('networkerror') ||
    text.includes('fetch failed')
  );
}

function buildNetworkHint(baseUrl: string): string {
  const lower = baseUrl.toLowerCase();
  const isLocalhost =
    lower.includes('localhost') ||
    lower.includes('127.0.0.1') ||
    lower.includes('0.0.0.0');
  const isHttp = lower.startsWith('http://');

  if (isLocalhost) {
    return 'NEXT_PUBLIC_API_URL points to localhost. Telegram WebView runs on user device and cannot reach your local server.';
  }

  if (isHttp) {
    return 'NEXT_PUBLIC_API_URL is HTTP. Telegram Mini Apps are loaded over HTTPS, so mixed content/network blocking is likely.';
  }

  return 'Backend is unreachable from Telegram WebView (network/DNS/CORS/TLS).';
}

function isQueryStringInitData(value: string): boolean {
  return value.includes('hash=') && value.includes('auth_date=') && value.includes('=');
}

export function normalizeInitData(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (isQueryStringInitData(trimmed)) {
    return trimmed;
  }

  if (!trimmed.startsWith('{')) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (
      typeof parsed.hash !== 'string' ||
      (typeof parsed.auth_date !== 'number' && typeof parsed.auth_date !== 'string')
    ) {
      return null;
    }

    const normalized = serializeInitDataQuery(parsed as never);
    return isQueryStringInitData(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

export function normalizeNetworkAuthError(message: string, baseUrl: string): {
  code?: string;
  message: string;
} {
  const networkError = isLikelyNetworkErrorMessage(message);
  if (!networkError) {
    return { message };
  }

  return {
    code: 'NETWORK_ERROR',
    message: `Network error during auth. ${buildNetworkHint(baseUrl)}`,
  };
}
