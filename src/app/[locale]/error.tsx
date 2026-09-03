'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    console.error('[page-error]', error.digest ?? '', error.message);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="stat-numeral text-brand-500">!</p>
      <h1 className="text-3xl md:text-4xl">{t('error')}</h1>
      {error.digest ? <p className="text-sm text-ink-600">#{error.digest}</p> : null}
      <Button size="lg" onClick={reset}>
        <RotateCcw aria-hidden />
        {t('retry')}
      </Button>
    </Container>
  );
}
