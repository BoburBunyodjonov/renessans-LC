'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, type Locale } from '@/types/i18n';
import { cn } from '@/lib/utils';

export function LangSwitcher({ locale, className }: { locale: Locale; className?: string }) {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      // `pathname` from next-intl is locale-agnostic, so the current page is kept.
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('languageSwitcher')}
        disabled={isPending}
        onClick={() => setOpen((value) => !value)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink-300/60 px-3 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900"
      >
        <Globe className="size-4" aria-hidden />
        {LOCALE_SHORT[locale]}
        <ChevronDown
          className={cn('size-4 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 min-w-44 overflow-hidden rounded-2xl border border-ink-300/50 bg-white py-1 shadow-card"
        >
          {LOCALES.map((item) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={item === locale}
                onClick={() => switchTo(item)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start text-sm transition-colors hover:bg-brand-50',
                  item === locale ? 'font-semibold text-brand-600' : 'text-ink-600',
                )}
              >
                {LOCALE_LABELS[item]}
                {item === locale ? <Check className="size-4" aria-hidden /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
