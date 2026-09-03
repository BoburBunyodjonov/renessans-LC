'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'analytics-consent';

type Consent = 'granted' | 'denied' | null;

function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/**
 * Loads GA4 / Meta Pixel only when an id is configured *and* the visitor has
 * consented. Non-essential tracking defaults to declined (PROMPT.md §7.17).
 */
export function Analytics({
  ga4Id,
  metaPixelId,
  yandexMetricaId,
}: {
  ga4Id: string | null;
  metaPixelId: string | null;
  yandexMetricaId: string | null;
}) {
  const t = useTranslations('consent');
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  const configured = Boolean(ga4Id || metaPixelId || yandexMetricaId);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  function decide(value: Exclude<Consent, null>) {
    setConsent(value);
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignore
    }
  }

  if (!configured) return null;

  return (
    <>
      {consent === 'granted' ? (
        <>
          {ga4Id ? (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
                strategy="afterInteractive"
              />
              <Script id="ga4-init" strategy="afterInteractive">
                {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});window.gtag=gtag;`}
              </Script>
            </>
          ) : null}

          {metaPixelId ? (
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
            </Script>
          ) : null}

          {yandexMetricaId ? (
            <Script id="yandex-metrica" strategy="afterInteractive">
              {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym('${yandexMetricaId}','init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
            </Script>
          ) : null}
        </>
      ) : null}

      {ready && consent === null ? (
        <div
          role="dialog"
          aria-label={t('title')}
          className="fixed inset-x-4 bottom-4 z-95 mx-auto max-w-md rounded-lg border border-ink-300/50 bg-white p-5 shadow-card md:inset-x-auto md:start-6"
        >
          <p className="font-display text-base font-extrabold text-ink-900">{t('title')}</p>
          <p className="mt-1.5 text-sm text-ink-600">{t('text')}</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => decide('granted')}>
              {t('accept')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => decide('denied')}
              className="text-ink-600"
            >
              {t('decline')}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
