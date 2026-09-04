'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { setAdminLocale } from '@/server/actions/admin-locale';
import { LOCALES, LOCALE_SHORT, type Locale } from '@/types/i18n';

/** Switches the admin UI language; the choice is stored per staff member. */
export function AdminLocaleSwitcher() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-admin-muted transition-colors hover:bg-admin-hover">
      <Globe className="size-4" aria-hidden />
      <span className="sr-only">{t('uiLanguage')}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(async () => {
            await setAdminLocale(next);
            router.refresh();
          });
        }}
        className="cursor-pointer bg-transparent font-semibold text-admin-text outline-none"
      >
        {LOCALES.map((item) => (
          <option key={item} value={item}>
            {LOCALE_SHORT[item as Locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
