export const LOCALES = ['uz', 'ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'uz';

/** Shape of every localized `Json` column in the database. */
export type Localized = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Reads a localized DB value for `locale`, falling back to `fb` (uz) when the
 * translation is missing or blank. Always returns a string, never undefined.
 */
export const t = (
  v: Localized | null | undefined,
  l: Locale,
  fb: Locale = DEFAULT_LOCALE,
): string => v?.[l]?.trim() || v?.[fb]?.trim() || '';

/** Same as `t` but for `Localized[]` columns (ticker items, bullet lists, ...). */
export const tList = (
  v: Localized[] | null | undefined,
  l: Locale,
  fb: Locale = DEFAULT_LOCALE,
): string[] => (v ?? []).map((item) => t(item, l, fb)).filter(Boolean);

/** Narrows an unknown Prisma `Json` column to `Localized`. */
export function asLocalized(value: unknown): Localized | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const out: Partial<Localized> = {};
  for (const locale of LOCALES) {
    const raw = record[locale];
    if (typeof raw === 'string') out[locale] = raw;
  }
  return { uz: out.uz ?? '', ru: out.ru ?? '', en: out.en ?? '' };
}

/** Narrows an unknown Prisma `Json` column to `Localized[]`. */
export function asLocalizedList(value: unknown): Localized[] {
  if (!Array.isArray(value)) return [];
  return value.map(asLocalized).filter((v): v is Localized => v !== null);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
  en: 'English',
};

export const LOCALE_SHORT: Record<Locale, string> = {
  uz: 'UZ',
  ru: 'RU',
  en: 'EN',
};

/** BCP-47 tags used for Intl formatting and hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};
