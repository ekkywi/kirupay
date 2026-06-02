export type LocalTimeFormatPreset = "date" | "datetime" | "compact" | "monthYear";

function getPresetOptions(preset: LocalTimeFormatPreset): Intl.DateTimeFormatOptions {
  if (preset === "date") {
    return { day: "2-digit", month: "short", year: "numeric" };
  }

  if (preset === "compact") {
    return { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  }

  if (preset === "monthYear") {
    return { month: "short", year: "numeric" };
  }

  return { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
}

export function formatLocalDateTime(
  input: Date | string | number | null | undefined,
  options?: {
    locale?: string;
    preset?: LocalTimeFormatPreset;
    fallback?: string;
  },
) {
  if (!input) return options?.fallback ?? "-";

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return options?.fallback ?? "-";

  return new Intl.DateTimeFormat(options?.locale || undefined, getPresetOptions(options?.preset || "datetime")).format(date);
}
