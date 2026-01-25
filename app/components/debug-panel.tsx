"use client";

import { useState } from "react";
import { useTelegram } from "@/app/components/providers/telegram-provider";
import {
  getDebugLogs,
  clearDebugLogs,
  exportDebugLogs,
  validateInitData,
  type DebugLogEntry,
} from "@/app/utils/debug";

/**
 * Debug panel component for troubleshooting authentication issues
 * Shows authentication status, initData validation, and debug logs
 */
export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const { user, initDataRaw, tokens, error, isReady, debugInfo } = useTelegram();

  const handleOpen = () => {
    setLogs(getDebugLogs());
    setIsOpen(true);
  };

  const handleClearLogs = () => {
    clearDebugLogs();
    setLogs([]);
  };

  const handleExport = () => {
    const data = exportDebugLogs();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tg-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validation = validateInitData(initDataRaw);

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 z-50 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center sm:items-center">
      <div className="bg-white w-full max-w-lg max-h-[80vh] rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Debug Panel</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Auth Status */}
          <section>
            <h3 className="font-medium text-gray-700 mb-2">Authentication Status</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <StatusRow
                label="Ready"
                value={isReady ? "Yes" : "No"}
                status={isReady ? "success" : "warning"}
              />
              <StatusRow
                label="User"
                value={user ? `ID: ${user.id}` : "Not authenticated"}
                status={user ? "success" : "error"}
              />
              <StatusRow
                label="Tokens"
                value={tokens?.accessToken ? "Present" : "Missing"}
                status={tokens?.accessToken ? "success" : "warning"}
              />
              <StatusRow
                label="Error"
                value={error || "None"}
                status={error ? "error" : "success"}
              />
              {debugInfo?.authStatus && (
                <StatusRow
                  label="Auth Status"
                  value={debugInfo.authStatus}
                  status={debugInfo.authStatus === "authenticated" ? "success" : "warning"}
                />
              )}
            </div>
          </section>

          {/* InitData Validation */}
          <section>
            <h3 className="font-medium text-gray-700 mb-2">InitData Validation</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
              <StatusRow
                label="Valid"
                value={validation.valid ? "Yes" : `No - ${validation.reason}`}
                status={validation.valid ? "success" : "error"}
              />
              <StatusRow
                label="Length"
                value={`${validation.details.length} chars`}
                status={validation.details.length > 100 ? "success" : "warning"}
              />
              <StatusRow
                label="Format"
                value={validation.details.format}
                status={validation.details.format === "query_string" ? "success" : "warning"}
              />
              <StatusRow
                label="Has Hash"
                value={validation.details.hasHash ? "Yes" : "No"}
                status={validation.details.hasHash ? "success" : "error"}
              />
              <StatusRow
                label="Has Auth Date"
                value={validation.details.hasAuthDate ? "Yes" : "No"}
                status={validation.details.hasAuthDate ? "success" : "error"}
              />
              <StatusRow
                label="Has User"
                value={validation.details.hasUser ? "Yes" : "No"}
                status={validation.details.hasUser ? "success" : "error"}
              />
            </div>
          </section>

          {/* User Info */}
          {user && (
            <section>
              <h3 className="font-medium text-gray-700 mb-2">User Info</h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span>{user.firstName} {user.lastName}</span>
                </div>
                {user.username && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span>@{user.username}</span>
                  </div>
                )}
                {user.languageCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span>{user.languageCode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span>{user.isPremium ? "Yes" : "No"}</span>
                </div>
              </div>
            </section>
          )}

          {/* Debug Logs */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">Debug Logs ({logs.length})</h3>
              <div className="space-x-2">
                <button
                  onClick={() => setLogs(getDebugLogs())}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
                <button
                  onClick={handleClearLogs}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
                <button
                  onClick={handleExport}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Export
                </button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">No logs yet</p>
              ) : (
                <div className="space-y-2">
                  {logs.slice(-10).reverse().map((log, i) => (
                    <div key={i} className="text-xs">
                      <span className={`
                        ${log.level === "error" ? "text-red-400" : ""}
                        ${log.level === "warn" ? "text-yellow-400" : ""}
                        ${log.level === "info" ? "text-green-400" : ""}
                      `}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-gray-400 ml-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <p className="text-gray-300 mt-0.5">{log.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Hints */}
          {error && (
            <section>
              <h3 className="font-medium text-gray-700 mb-2">Troubleshooting Hints</h3>
              <ul className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Make sure the app is opened from Telegram</li>
                <li>Check that NEXT_PUBLIC_API_URL is set correctly</li>
                <li>Verify BOT_TOKEN on the server matches the Mini App bot</li>
                <li>Try using Telegram Desktop (has DevTools with F12)</li>
                <li>Check server logs for detailed error messages</li>
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "success" | "warning" | "error";
}) {
  const statusColors = {
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
  };

  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-600">{label}:</span>
      <span className={`${statusColors[status]} text-right max-w-[60%] break-words`}>
        {value}
      </span>
    </div>
  );
}
