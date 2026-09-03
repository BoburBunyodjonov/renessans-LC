'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle, Phone, X } from 'lucide-react';
import { TelegramIcon } from '@/components/shared/brand-icons';
import { useLeadModal } from '@/components/shared/lead-modal';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export function FloatingActions({
  phone,
  telegramUrl,
}: {
  phone: string | null;
  telegramUrl: string | null;
}) {
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');
  const { open } = useLeadModal();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed end-4 bottom-4 z-90 flex flex-col items-end gap-3 md:end-6 md:bottom-6">
      {expanded ? (
        <ul className="flex flex-col items-end gap-2">
          {telegramUrl ? (
            <li>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('telegram_clicked')}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-card transition-colors hover:text-brand-600"
              >
                <TelegramIcon className="size-4" />
                {t('writeTelegram')}
              </a>
            </li>
          ) : null}
          {phone ? (
            <li>
              <a
                href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                onClick={() => track('call_clicked')}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-card transition-colors hover:text-brand-600"
              >
                <Phone className="size-4" aria-hidden />
                {t('callUs')}
              </a>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                open({ source: 'FLOATING_CTA' });
              }}
              className="flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white shadow-card"
            >
              {t('leadTitle')}
            </button>
          </li>
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label={expanded ? tCommon('close') : t('quickActions')}
        className={cn(
          'grid size-14 place-items-center rounded-full text-white shadow-brand transition-transform',
          expanded ? 'rotate-90 bg-ink-900' : 'bg-brand-600 hover:scale-105',
        )}
      >
        {expanded ? (
          <X className="size-6" aria-hidden />
        ) : (
          <MessageCircle className="size-6" aria-hidden />
        )}
      </button>
    </div>
  );
}
