import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Clock, ListChecks } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { Icon } from '@/components/shared/icon';
import { Link } from '@/i18n/navigation';
import { getTestCategories } from '@/server/queries/tests';
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
  const t = await getTranslations({ locale, namespace: 'test' });
  return {
    title: t('title'),
    description: t('chooseSubtitle'),
    alternates: {
      canonical: `/${locale}/choose-level`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}/choose-level`])),
    },
  };
}

export default async function ChooseLevelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [categories, t, tNav, tCommon] = await Promise.all([
    getTestCategories(locale as Locale),
    getTranslations({ locale, namespace: 'test' }),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: tNav('home'), path: `/${locale}` },
            { name: tNav('test'), path: `/${locale}/choose-level` },
          ]}
        />
      </Container>

      <Section tone="paper" className="pt-8 md:pt-10">
        <SectionHeader
          eyebrow={t('title')}
          title={t('chooseTitle')}
          subtitle={t('chooseSubtitle')}
        />

        <RevealGroup as="ul" className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <RevealItem
              as="li"
              key={category.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-ink-300/40 bg-white shadow-card"
            >
              {category.imageUrl ? (
                <div className="relative aspect-16/9 w-full">
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
                <span className="grid size-14 place-items-center rounded-md bg-brand-50 text-brand-600">
                  <Icon name={category.icon} className="size-7" />
                </span>

                <h2 className="text-2xl md:text-3xl">{category.title}</h2>
                {category.subtitle ? (
                  <p className="text-sm text-ink-600 md:text-base">{category.subtitle}</p>
                ) : null}

                <ul className="flex flex-wrap gap-2">
                  <li>
                    <Badge variant="outline" size="md">
                      <ListChecks className="size-3.5" aria-hidden />
                      {t('questionCount', { count: category.questionCount })}
                    </Badge>
                  </li>
                  {category.timeLimitSec ? (
                    <li>
                      <Badge variant="outline" size="md">
                        <Clock className="size-3.5" aria-hidden />
                        {t('estimatedTime', { minutes: Math.round(category.timeLimitSec / 60) })}
                      </Badge>
                    </li>
                  ) : null}
                </ul>

                <div className="mt-auto flex flex-wrap gap-3 pt-2">
                  <Button asChild size="lg">
                    <Link href={`/tests/${category.slug}`}>
                      {tCommon('continue')}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" asChild>
                    <Link href="/">{tCommon('back')}</Link>
                  </Button>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
