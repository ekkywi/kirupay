"use client";

import { formatLocalDateTime, type LocalTimeFormatPreset } from "@/lib/local-time";

type LocalTimeProps = {
  value: Date | string | number | null | undefined;
  preset?: LocalTimeFormatPreset;
  locale?: string;
  fallback?: string;
  className?: string;
  withTitle?: boolean;
};

export function LocalTime({ value, preset = "datetime", locale, fallback = "-", className, withTitle = false }: LocalTimeProps) {
  const formatted = formatLocalDateTime(value, { locale, preset, fallback });

  const title = withTitle ? `Local time: ${formatted}` : undefined;

  return (
    <time className={className} dateTime={value ? new Date(value).toISOString() : undefined} title={title}>
      {formatted}
    </time>
  );
}
