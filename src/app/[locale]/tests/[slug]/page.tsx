import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TestRunner } from '@/components/test/test-runner';
import { getTestCategorySlugs, getTestRunner } from '@/server/queries/tests';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/types/i18n';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getTestCategorySlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const runner = await getTestRunner(slug, locale as Locale);
  if (!runner) return {};

  return {
    title: runner.title,
    description: runner.subtitle ?? undefined,
    // A test run is not a landing page; keep it out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function TestPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [runner, t] = await Promise.all([
    getTestRunner(slug, locale as Locale),
    getTranslations({ locale, namespace: 'test' }),
  ]);

  if (!runner || runner.questions.length === 0) notFound();

  return <TestRunner slug={slug} runner={runner} startLabel={t('start')} />;
}
