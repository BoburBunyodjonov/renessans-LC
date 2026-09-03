import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Briefcase, Wallet } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { Link } from '@/i18n/navigation';
import { getHiringSteps, getVacancies } from '@/server/queries/careers';
import { formatPrice } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import { LOCALE_TAGS, type Locale } from '@/types/i18n';

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
  const t = await getTranslations({ locale, namespace: 'careers' });
  return {
    title: t('heroTitle'),
    description: t('heroSubtitle'),
    alternates: {
      canonical: `/${locale}/join-team`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}/join-team`])),
    },
  };
}

export default async function JoinTeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [vacancies, steps, t, tNav, tCommon] = await Promise.all([
    getVacancies(typedLocale),
    getHiringSteps(typedLocale),
    getTranslations({ locale, namespace: 'careers' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <>
      <section className="bg-ink-900 text-white">
        <Container className="py-10 md:py-16">
          <Breadcrumbs
            items={[
              { name: tNav('home'), path: `/${locale}` },
              { name: tNav('joinTeam'), path: `/${locale}/join-team` },
            ]}
            tone="dark"
          />
          <h1 className="mt-6 max-w-3xl text-3xl text-white md:text-5xl">{t('heroTitle')}</h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">{t('heroSubtitle')}</p>
        </Container>
      </section>

      <Section tone="paper">
        <SectionHeader title={t('openPositions')} />

        {vacancies.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink-300/50 p-10 text-center text-ink-600">
            {t('noVacancies')}
          </p>
        ) : (
          <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2">
            {vacancies.map((vacancy) => {
              const from = formatPrice(vacancy.salaryFrom, LOCALE_TAGS[typedLocale]);
              const to = formatPrice(vacancy.salaryTo, LOCALE_TAGS[typedLocale]);
              return (
                <RevealItem
                  as="li"
                  key={vacancy.id}
                  className="flex flex-col gap-3 rounded-lg border border-ink-300/40 bg-white p-6 shadow-card transition-transform hover:-translate-y-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {vacancy.department ? (
                      <Badge variant="brand">
                        <Briefcase className="size-3.5" aria-hidden />
                        {vacancy.department}
                      </Badge>
                    ) : null}
                    {vacancy.employmentType ? (
                      <Badge variant="outline">{vacancy.employmentType}</Badge>
                    ) : null}
                  </div>

                  <h2 className="text-xl">{vacancy.title}</h2>
                  <p className="text-sm text-ink-600">{vacancy.shortDesc}</p>

                  {vacancy.showSalary && (from || to) ? (
                    <p className="inline-flex items-center gap-2 text-sm font-bold text-ink-900">
                      <Wallet className="size-4 text-brand-600" aria-hidden />
                      {from ? `${t('salaryFrom')} ${from}` : null}
                      {to ? ` ${t('salaryTo')} ${to}` : null} UZS
                    </p>
                  ) : null}

                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Button size="sm" asChild>
                      <Link href={`/join-team/${vacancy.slug}`}>
                        {t('apply')}
                        <ArrowRight aria-hidden />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/join-team/${vacancy.slug}`}>{tCommon('readMore')}</Link>
                    </Button>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </Section>

      {steps.length > 0 ? (
        <Section tone="alt">
          <SectionHeader title={t('hiringProcess')} />
          <ol className="relative flex flex-col gap-6 md:gap-8">
            {steps.map((step, index) => (
              <li key={step.id} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 font-display text-lg font-extrabold text-white">
                    {index + 1}
                  </span>
                  {index < steps.length - 1 ? (
                    <span aria-hidden className="mt-2 w-px flex-1 bg-ink-300/60" />
                  ) : null}
                </div>
                <div className="pb-2">
                  <h3 className="text-lg">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-600 md:text-base">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}
    </>
  );
}
