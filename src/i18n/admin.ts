import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/types/i18n';

/**
 * The admin panel is not locale-prefixed, so its UI language comes from a
 * cookie the staff member sets instead of from the URL. `i18n/request.ts`
 * reads the same cookie, which is why this module avoids `server-only`.
 */
export const ADMIN_LOCALE_COOKIE = 'admin_locale';

export async function getAdminLocale(): Promise<Locale> {
  const value = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Loads only the namespaces the admin renders. */
export async function getAdminMessages(locale: Locale) {
  const all = (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>;
  return {
    admin: all.admin,
    common: all.common,
  };
}
