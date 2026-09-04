import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { ADMIN_LOCALE_COOKIE } from './admin';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // The public site carries its locale in the URL. The admin panel does not, so
  // for those requests the locale comes from the staff member's cookie instead —
  // without this, server components in /admin would always render the default.
  const fromCookie = requested ? undefined : (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;

  const candidate = requested ?? fromCookie;
  const locale = hasLocale(routing.locales, candidate) ? candidate : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Tashkent',
    now: new Date(),
  };
});
