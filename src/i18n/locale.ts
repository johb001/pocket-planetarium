import type { Locale } from "../types";

const LOCALE_STORAGE_KEY = "pocket-planetarium:locale";

export function detectLocale(languages: readonly string[] = navigator.languages): Locale {
  return languages.some((language) => language.toLowerCase().startsWith("zh")) ? "zh" : "en";
}

export function loadLocale(languages?: readonly string[]): Locale {
  const savedLocale = readSavedLocale();

  return savedLocale ?? detectLocale(languages);
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Locale persistence is a convenience; blocked storage should not break the app.
  }
}

export function toggleLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

function readSavedLocale(): Locale | undefined {
  try {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY);
    return value === "zh" || value === "en" ? value : undefined;
  } catch {
    return undefined;
  }
}
