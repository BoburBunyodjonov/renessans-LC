'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** The map iframe is only mounted after an explicit click. */
export function LazyMap({ embedUrl, title }: { embedUrl: string; title: string }) {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);

  if (visible) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-16/9 w-full rounded-lg border-0 md:aspect-21/9"
      />
    );
  }

  return (
    <div className="flex aspect-16/9 w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-ink-300/50 bg-paper-alt md:aspect-21/9">
      <MapPin className="size-10 text-brand-500" aria-hidden />
      <Button variant="dark" onClick={() => setVisible(true)}>
        {t('showAll')}
      </Button>
    </div>
  );
}
