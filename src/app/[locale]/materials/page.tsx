import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FileText, Headphones, ImageIcon, Video } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { Link } from '@/i18n/navigation';
import { getMaterialCounts } from '@/server/queries/home';
import { routing } from '@/i18n/routing';
import type { MaterialTypeKey } from '@/types/content';

export const revalidate = 300;

const TYPES: { type: MaterialTypeKey; slug: string; icon: typeof FileText; key: string }[] = [
  { type: 'PDF', slug: 'pdf', icon: FileText, key: 'pdf' },
  { type: 'AUDIO', slug: 'audio', icon: Headphones, key: 'audio' },
  { type: 'VIDEO', slug: 'video', icon: Video, key: 'video' },
  { type: 'PHOTO', slug: 'photo', icon: ImageIcon, key: 'photo' },
];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'materials' });
  return {
    title: t('hubTitle'),
    description: t('hubSubtitle'),
    alternates: {
      canonical: `/${locale}/materials`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}/materials`])),
    },
  };
}

export default async function MaterialsHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [counts, t, tNav] = await Promise.all([
    getMaterialCounts(),
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
          ]}
        />
      </Container>

      <Section tone="paper" className="pt-8 md:pt-10">
        <SectionHeader title={t('hubTitle')} subtitle={t('hubSubtitle')} />

        <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TYPES.map(({ type, slug, icon: TypeIcon, key }) => (
            <RevealItem as="li" key={type}>
              <Link
                href={`/materials/${slug}`}
                className="group flex h-full flex-col gap-3 rounded-lg border border-ink-300/40 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand-600"
                aria-disabled={counts[type] === 0}
              >
                <span className="grid size-12 place-items-center rounded-md bg-brand-50 text-brand-600">
                  <TypeIcon className="size-6" aria-hidden />
                </span>
                <h2 className="text-lg">{t(key)}</h2>
                <p className="mt-auto text-sm font-semibold text-ink-600 tabular-nums">
                  {t('itemsCount', { count: counts[type] })}
                </p>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
