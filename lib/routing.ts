export const LOCALES = ['en', 'fr'] as const;
export const DEFAULT_LOCALE = 'en';

export type Locale = typeof LOCALES[number];

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}
