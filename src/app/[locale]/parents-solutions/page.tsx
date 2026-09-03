import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ProblemSolutionTabs } from '@/components/sections/problem-solutions';
import { getProblems } from '@/server/queries/home';
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
    title: t('parentsTitle'),
    description: t('parentsSubtitle'),
    alternates: {
      canonical: `/${locale}/parents-solutions`,
      languages: Object.fromEntries(
        routing.locales.map((item) => [item, `/${item}/parents-solutions`]),
      ),
    },
  };
}

export default async function ParentsSolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [problems, t, tNav] = await Promise.all([
    getProblems(locale as Locale),
    getTranslations({ locale, namespace: 'pages' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: tNav('home'), path: `/${locale}` },
            { name: tNav('parentsSolutions'), path: `/${locale}/parents-solutions` },
          ]}
        />
      </Container>

      <Section tone="paper" className="pt-8 md:pt-10">
        <SectionHeader title={t('parentsTitle')} subtitle={t('parentsSubtitle')} />
        <ProblemSolutionTabs problems={problems} />
      </Section>
    </>
  );
}
