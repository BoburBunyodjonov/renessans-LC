'use client';

export type AnalyticsEvent =
  | 'lead_submitted'
  | 'test_started'
  | 'test_completed'
  | 'material_downloaded'
  | 'vacancy_applied'
  | 'call_clicked'
  | 'telegram_clicked';

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const META_STANDARD: Partial<Record<AnalyticsEvent, string>> = {
  lead_submitted: 'Lead',
  vacancy_applied: 'SubmitApplication',
  test_completed: 'CompleteRegistration',
};

/** Thin wrapper — no-ops when no analytics id is configured. */
export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === 'undefined') return;

  try {
    window.gtag?.('event', event, props);

    const metaEvent = META_STANDARD[event];
    if (metaEvent) {
      window.fbq?.('track', metaEvent, props);
    } else {
      window.fbq?.('trackCustom', event, props);
    }
  } catch {
    // Analytics must never break the page.
  }
}
