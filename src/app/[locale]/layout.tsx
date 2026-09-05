import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { inter, poppins } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { getBrandScale, getNavigation, getSiteSettings } from '@/server/queries/site';
import { getCourses } from '@/server/queries/courses';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { LeadModalProvider } from '@/components/shared/lead-modal';
import { themeCss } from '@/lib/theme';
import { DeferredChrome } from '@/components/shared/deferred-chrome';
import { DraftBanner } from '@/components/shared/draft-banner';
import type { Locale } from '@/types/i18n';
import '../globals.css';

/** Namespaces used by `'use client'` components (see the layout body). */
const CLIENT_NAMESPACES = [
  'common',
  'forms',
  'home',
  'pages',
  'skills',
  'materials',
  'test',
  'careers',
  'consent',
] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getSiteSettings(locale),
  ]);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: `${settings.brandName} — ${t('metaTitle')}`,
      template: `%s | ${settings.brandName}`,
    },
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: 'website',
      locale,
      alternateLocale: routing.locales.filter((l) => l !== locale),
      siteName: settings.brandName,
      title: `${settings.brandName} — ${t('metaTitle')}`,
      description: t('metaDescription'),
      images: [
        {
          url:
            settings.ogImageUrl ??
            `/api/og?title=${encodeURIComponent(settings.brandName)}&subtitle=${encodeURIComponent(settings.tagline)}`,
        },
      ],
    },
    twitter: { card: 'summary_large_image' },
    icons: { icon: settings.faviconUrl ?? '/icon.svg' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const typedLocale = locale as Locale;
  const [settings, nav, courses, brand, t] = await Promise.all([
    getSiteSettings(typedLocale),
    getNavigation(typedLocale),
    getCourses(typedLocale),
    getBrandScale(),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const leadCourses = courses.map((course) => ({ id: course.id, title: course.title }));

  // Only the namespaces client components actually read are sent to the browser;
  // the rest (nav, blog, admin) are resolved on the server and would otherwise
  // ride along in every page's RSC payload.
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((namespace) => namespace in messages).map((namespace) => [
      namespace,
      messages[namespace],
    ]),
  );

  return (
    <html lang={locale} className={cn(inter.variable, poppins.variable)} suppressHydrationWarning>
      <head>
        {/* Marks the document as script-enabled so scroll-reveal elements may
            start hidden. Without JS they simply render. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js='1'" }} />
        {/* Brand palette chosen in the admin. Inline rather than a stylesheet
            so it lands before first paint and never flashes the old colour. */}
        <style dangerouslySetInnerHTML={{ __html: themeCss(brand) }} />
      </head>
      <body className="min-h-screen bg-paper text-ink-600 antialiased">
        <NextIntlClientProvider messages={clientMessages}>
          <LeadModalProvider courses={leadCourses}>
            <a
              href="#main"
              className="sr-only rounded-full bg-ink-900 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:ring-brand-500"
            >
              {t('skipToContent')}
            </a>
            <DraftBanner />
            <Header settings={settings} nav={nav} locale={typedLocale} />
            <main id="main">{children}</main>
            <Footer settings={settings} nav={nav} />
            <DeferredChrome
              phone={settings.phones[0] ?? null}
              telegramUrl={settings.socials.telegram ?? null}
              ga4Id={settings.ga4Id}
              metaPixelId={settings.metaPixelId}
              yandexMetricaId={settings.yandexMetricaId}
            />
          </LeadModalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
