import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check, Wallet } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { JsonLd } from '@/components/shared/json-ld';
import { ApplicationForm } from '@/components/careers/application-form';
import { getVacancies, getVacancyBySlug } from '@/server/queries/careers';
import { getSiteSettings } from '@/server/queries/site';
import { breadcrumbJsonLd } from '@/lib/seo';
import { absoluteUrl, formatPrice } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import { LOCALE_TAGS, type Locale } from '@/types/i18n';

export const revalidate = 300;

export async function generateStaticParams() {
  const vacancies = await getVacancies('uz');
  return routing.locales.flatMap((locale) =>
    vacancies.map((vacancy) => ({ locale, slug: vacancy.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const vacancy = await getVacancyBySlug(slug, locale as Locale);
  if (!vacancy) return {};

  return {
    title: vacancy.title,
    description: vacancy.shortDesc,
    alternates: {
      canonical: `/${locale}/join-team/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((item) => [item, `/${item}/join-team/${slug}`]),
      ),
    },
  };
}

export default async function VacancyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [vacancy, settings, t, tNav] = await Promise.all([
    getVacancyBySlug(slug, typedLocale),
    getSiteSettings(typedLocale),
    getTranslations({ locale, namespace: 'careers' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  if (!vacancy) notFound();

  const crumbs = [
    { name: tNav('home'), path: `/${locale}` },
    { name: tNav('joinTeam'), path: `/${locale}/join-team` },
    { name: vacancy.title, path: `/${locale}/join-team/${slug}` },
  ];

  const from = formatPrice(vacancy.salaryFrom, LOCALE_TAGS[typedLocale]);
  const to = formatPrice(vacancy.salaryTo, LOCALE_TAGS[typedLocale]);

  const jobPosting: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: vacancy.title,
    description: vacancy.description ?? vacancy.shortDesc,
    hiringOrganization: {
      '@type': 'Organization',
      name: settings.brandName,
      sameAs: absoluteUrl(`/${locale}`),
    },
    jobLocationType: 'TELECOMMUTE',
    employmentType: vacancy.employmentType ?? undefined,
    ...(vacancy.showSalary && vacancy.salaryFrom
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: settings.currency,
            value: {
              '@type': 'QuantitativeValue',
              minValue: vacancy.salaryFrom,
              maxValue: vacancy.salaryTo ?? vacancy.salaryFrom,
              unitText: 'MONTH',
            },
          },
        }
      : {}),
  };

  const lists: [string, string[]][] = [
    [t('responsibilities'), vacancy.responsibilities],
    [t('requirements'), vacancy.requirements],
    [t('conditions'), vacancy.conditions],
  ];

  return (
    <>
      <JsonLd data={jobPosting} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <section className="bg-ink-900 text-white">
        <Container className="py-10 md:py-14">
          <Breadcrumbs items={crumbs} tone="dark" />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {vacancy.department ? <Badge variant="light">{vacancy.department}</Badge> : null}
            {vacancy.employmentType ? (
              <Badge variant="light">{vacancy.employmentType}</Badge>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl text-white md:text-5xl">{vacancy.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">{vacancy.shortDesc}</p>
          {vacancy.showSalary && (from || to) ? (
            <p className="mt-5 inline-flex items-center gap-2 text-lg font-bold">
              <Wallet className="size-5" aria-hidden />
              {from ? `${t('salaryFrom')} ${from}` : null}
              {to ? ` ${t('salaryTo')} ${to}` : null} {settings.currency}
            </p>
          ) : null}
        </Container>
      </section>

      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-8">
            {vacancy.description ? (
              <div
                className="legal-copy text-ink-600"
                dangerouslySetInnerHTML={{ __html: vacancy.description }}
              />
            ) : null}

            {lists.map(([title, items]) =>
              items.length > 0 ? (
                <div key={title}>
                  <h2 className="mb-4 text-2xl">{title}</h2>
                  <ul className="flex flex-col gap-2.5">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-ink-600 md:text-base"
                      >
                        <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </div>

          <aside id="apply" className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-ink-300/40 bg-white p-6 shadow-card md:p-7">
              <h2 className="text-xl">{t('applyTitle')}</h2>
              <p className="mt-1 mb-5 text-sm text-ink-600">{t('applySubtitle')}</p>
              <ApplicationForm vacancyId={vacancy.id} />
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
