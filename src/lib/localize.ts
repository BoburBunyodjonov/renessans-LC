import { asLocalized, asLocalizedList, t, tList, type Locale } from '@/types/i18n';

/** Reads a localized `Json` column as a plain string (falls back to uz). */
export const loc = (value: unknown, locale: Locale): string => t(asLocalized(value), locale);

/** Same as `loc`, but returns `null` instead of an empty string. */
export const locOrNull = (value: unknown, locale: Locale): string | null =>
  loc(value, locale) || null;

/** Reads a `Localized[]` column (bullet lists, ticker items, ...). */
export const locList = (value: unknown, locale: Locale): string[] =>
  tList(asLocalizedList(value), locale);
