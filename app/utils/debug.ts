/**
 * Debug utilities for Telegram Mini App
 * Helps troubleshoot authentication issues in environments without DevTools
 */

const DEBUG_KEY = "tg_debug_logs";
const MAX_LOGS = 50;

export interface DebugLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: unknown;
}

/**
 * Store debug log in localStorage for later inspection
 */
export function logDebug(
  level: DebugLogEntry["level"],
  message: string,
  data?: unknown
): void {
  const entry: DebugLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };

  // Log to console
  const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  consoleMethod(`[TG Debug] ${message}`, data || "");

  // Store in localStorage
  if (typeof localStorage !== "undefined") {
    try {
      const existing = localStorage.getItem(DEBUG_KEY);
      const logs: DebugLogEntry[] = existing ? JSON.parse(existing) : [];
      logs.push(entry);
      
      // Keep only last N logs
      while (logs.length > MAX_LOGS) {
        logs.shift();
      }
      
      localStorage.setItem(DEBUG_KEY, JSON.stringify(logs));
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Get stored debug logs
 */
export function getDebugLogs(): DebugLogEntry[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(DEBUG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored debug logs
 */
export function clearDebugLogs(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(DEBUG_KEY);
  }
}

/**
 * Validate initData format
 */
export interface InitDataValidation {
  valid: boolean;
  reason?: string;
  details: {
    length: number;
    hasHash: boolean;
    hasAuthDate: boolean;
    hasUser: boolean;
    format: "query_string" | "json" | "unknown";
  };
}

export function validateInitData(initData: string | null | undefined): InitDataValidation {
  if (!initData) {
    return {
      valid: false,
      reason: "initData is null or undefined",
      details: {
        length: 0,
        hasHash: false,
        hasAuthDate: false,
        hasUser: false,
        format: "unknown",
      },
    };
  }

  const details: InitDataValidation["details"] = {
    length: initData.length,
    hasHash: initData.includes("hash="),
    hasAuthDate: initData.includes("auth_date="),
    hasUser: initData.includes("user=") || initData.includes('"user"'),
    format: "unknown",
  };

  // Detect format
  if (initData.trim().startsWith("{")) {
    details.format = "json";
  } else if (initData.includes("=") && initData.includes("&")) {
    details.format = "query_string";
  }

  // Validation checks
  if (details.length === 0) {
    return { valid: false, reason: "initData is empty", details };
  }

  if (details.length < 50) {
    return { valid: false, reason: "initData too short (< 50 chars)", details };
  }

  if (!details.hasHash) {
    return { valid: false, reason: "Missing 'hash' field", details };
  }

  if (!details.hasAuthDate) {
    return { valid: false, reason: "Missing 'auth_date' field", details };
  }

  if (!details.hasUser) {
    return { valid: false, reason: "Missing 'user' field", details };
  }

  if (details.format === "unknown") {
    return { valid: false, reason: "Unknown format (expected query string or JSON)", details };
  }

  return { valid: true, details };
}

/**
 * Log authentication error with helpful context
 */
export function logAuthError(
  stage: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  logDebug("error", `Auth error at ${stage}: ${errorMessage}`, {
    stage,
    error: errorMessage,
    ...context,
    hints: getAuthErrorHints(stage, errorMessage),
  });
}

/**
 * Get helpful hints based on error type
 */
function getAuthErrorHints(stage: string, error: string): string[] {
  const hints: string[] = [];

  if (error.includes("401") || error.includes("Unauthorized")) {
    hints.push("Check that BOT_TOKEN in server matches the bot that owns this Mini App");
    hints.push("Verify initData is being sent correctly in Authorization header");
    hints.push("Check that initData hasn't expired (backend default: 300 seconds)");
  }

  if (error.includes("400") || error.includes("Bad Request")) {
    hints.push("Check initData format - should be URL-encoded query string");
    hints.push("Verify the server is parsing initData correctly");
  }

  if (error.includes("Network") || error.includes("fetch")) {
    hints.push("Check NEXT_PUBLIC_API_URL is set correctly");
    hints.push("Verify backend server is running and accessible");
    hints.push("Check for CORS issues if frontend and backend are on different domains");
  }

  if (stage === "no_init_data") {
    hints.push("Make sure the app is opened from within Telegram");
    hints.push("Check that Telegram SDK is properly initialized");
    hints.push("Try using Telegram Desktop for debugging (has DevTools)");
  }

  return hints;
}

/**
 * Create a debug summary string for display in UI
 */
export function getDebugSummary(): string {
  const logs = getDebugLogs();
  const errors = logs.filter(l => l.level === "error");
  const lastError = errors[errors.length - 1];
  
  if (lastError) {
    return `Last error: ${lastError.message} (${lastError.timestamp})`;
  }
  
  return `${logs.length} debug entries logged`;
}

/**
 * Export debug logs as JSON string (for sharing/inspection)
 */
export function exportDebugLogs(): string {
  const logs = getDebugLogs();
  return JSON.stringify(logs, null, 2);
}
