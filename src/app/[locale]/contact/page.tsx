import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ContactSection } from '@/components/sections/contact';
import { getBranches, getHomeSections } from '@/server/queries/home';
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
    title: t('contactTitle'),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}/contact`])),
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [branches, settings, sections, tNav] = await Promise.all([
    getBranches(typedLocale),
    getSiteSettings(typedLocale),
    getHomeSections(typedLocale),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: tNav('home'), path: `/${locale}` },
            { name: tNav('contact'), path: `/${locale}/contact` },
          ]}
        />
      </Container>

      <ContactSection
        branches={branches}
        settings={settings}
        section={sections.find((section) => section.key === 'contact')}
        locale={typedLocale}
      />
    </>
  );
}
