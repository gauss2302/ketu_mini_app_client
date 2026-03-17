"use client";

import React from "react";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function LoadingIndicator({
  label = "Loading...",
  compact = false,
  className,
}: {
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex items-center",
        compact ? "gap-2" : "gap-3 justify-center py-3",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cx("relative", compact ? "h-5 w-5" : "h-8 w-8")}>
        <div className="absolute inset-0 rounded-full border-2 border-[#FF7352]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF7352] border-r-[#FF7352] animate-spin" />
      </div>
      <span className={cx("text-gray-600 dark:text-gray-300", compact ? "text-sm" : "text-sm font-medium")}>
        {label}
      </span>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
      <div
      className={cx(
        "animate-pulse rounded-xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
        className
      )}
      aria-hidden="true"
    />
  );
}
