import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { MaterialBrowser } from '@/components/materials/material-browser';
import { MaterialBrowserSkeleton } from '@/components/materials/material-browser-skeleton';
import {
  getMaterialGroups,
  getMaterialLevels,
  getMaterialsByType,
} from '@/server/queries/materials';
import { routing } from '@/i18n/routing';
import type { MaterialTypeKey } from '@/types/content';
import type { Locale } from '@/types/i18n';

export const revalidate = 300;

const TYPE_BY_SLUG: Record<string, { type: MaterialTypeKey; key: string }> = {
  pdf: { type: 'PDF', key: 'pdf' },
  audio: { type: 'AUDIO', key: 'audio' },
  video: { type: 'VIDEO', key: 'video' },
  photo: { type: 'PHOTO', key: 'photo' },
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(TYPE_BY_SLUG).map((type) => ({ locale, type })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale, type } = await params;
  const entry = TYPE_BY_SLUG[type];
  if (!entry) return {};

  const t = await getTranslations({ locale, namespace: 'materials' });
  return {
    title: t(entry.key),
    description: t('hubSubtitle'),
    alternates: {
      canonical: `/${locale}/materials/${type}`,
      languages: Object.fromEntries(
        routing.locales.map((item) => [item, `/${item}/materials/${type}`]),
      ),
    },
  };
}

export default async function MaterialTypePage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  setRequestLocale(locale);

  const entry = TYPE_BY_SLUG[type];
  if (!entry) notFound();

  const typedLocale = locale as Locale;
  const [materials, groups, levels, t, tNav] = await Promise.all([
    getMaterialsByType(entry.type, typedLocale),
    getMaterialGroups(entry.type, typedLocale),
    getMaterialLevels(entry.type),
    getTranslations({ locale, namespace: 'materials' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: tNav('home'), path: `/${locale}` },
            { name: tNav('materials'), path: `/${locale}/materials` },
            { name: t(entry.key), path: `/${locale}/materials/${type}` },
          ]}
        />
      </Container>

      <Section tone="paper" className="pt-8 md:pt-10">
        <SectionHeader
          title={t(entry.key)}
          subtitle={t('itemsCount', { count: materials.length })}
        />
        {/* The browser reads filter state from the URL, so it needs a boundary
            for the static prerender. */}
        <Suspense fallback={<MaterialBrowserSkeleton count={Math.min(6, materials.length || 3)} />}>
          <MaterialBrowser materials={materials} groups={groups} levels={levels} />
        </Suspense>
      </Section>
    </>
  );
}
