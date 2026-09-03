import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { getSiteSettings } from '@/server/queries/site';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/types/i18n';

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return {
    title: t('privacyTitle'),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}/privacy`])),
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, t, tNav] = await Promise.all([
    getSiteSettings(locale as Locale),
    getTranslations({ locale, namespace: 'pages' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: tNav('home'), path: `/${locale}` },
            { name: tNav('privacy'), path: `/${locale}/privacy` },
          ]}
        />
      </Container>

      <Section tone="paper" className="pt-8 md:pt-10">
        <h1 className="mb-8 text-3xl md:text-4xl">{t('privacyTitle')}</h1>
        {settings.privacyPolicy ? (
          <div
            className="legal-copy max-w-3xl text-ink-600"
            // Policy text is authored in the admin and sanitized on save.
            dangerouslySetInnerHTML={{ __html: settings.privacyPolicy }}
          />
        ) : null}
      </Section>
    </>
  );
}
