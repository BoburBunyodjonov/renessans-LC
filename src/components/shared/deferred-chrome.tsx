'use client';

import dynamic from 'next/dynamic';

/**
 * Non-essential chrome, loaded after hydration: neither element is content, so
 * keeping them out of the initial bundle buys first-paint budget on mobile.
 */
const FloatingActions = dynamic(
  () => import('@/components/shared/floating-actions').then((mod) => mod.FloatingActions),
  { ssr: false },
);

const Analytics = dynamic(
  () => import('@/components/shared/analytics').then((mod) => mod.Analytics),
  { ssr: false },
);

export function DeferredChrome({
  phone,
  telegramUrl,
  ga4Id,
  metaPixelId,
  yandexMetricaId,
}: {
  phone: string | null;
  telegramUrl: string | null;
  ga4Id: string | null;
  metaPixelId: string | null;
  yandexMetricaId: string | null;
}) {
  return (
    <>
      <FloatingActions phone={phone} telegramUrl={telegramUrl} />
      <Analytics ga4Id={ga4Id} metaPixelId={metaPixelId} yandexMetricaId={yandexMetricaId} />
    </>
  );
}
