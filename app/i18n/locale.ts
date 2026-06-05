export type Locale = "zh-CN" | "en";

const STORAGE_KEY = "yn-docs-locale";

export function getDefaultLocale(): Locale {
  if (typeof window === "undefined") return "zh-CN";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "zh-CN" || saved === "en") return saved;
  return navigator.language.startsWith("zh") ? "zh-CN" : "en";
}

let currentLocale: Locale = getDefaultLocale();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en";
}

export type L10nText = { "zh-CN": string; en: string };

export function lt(text: L10nText, locale: Locale = getLocale()): string {
  return text[locale];
}
