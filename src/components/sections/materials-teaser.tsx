import { getTranslations } from 'next-intl/server';
import { FileText, Headphones, ImageIcon, Video } from 'lucide-react';
import { Section, SectionHeader } from '@/components/ui/section';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { Link } from '@/i18n/navigation';
import type { HomeSectionView, MaterialCounts, MaterialTypeKey } from '@/types/content';
import type { Locale } from '@/types/i18n';

const TYPES: { type: MaterialTypeKey; slug: string; icon: typeof FileText; key: string }[] = [
  { type: 'PDF', slug: 'pdf', icon: FileText, key: 'pdf' },
  { type: 'AUDIO', slug: 'audio', icon: Headphones, key: 'audio' },
  { type: 'VIDEO', slug: 'video', icon: Video, key: 'video' },
  { type: 'PHOTO', slug: 'photo', icon: ImageIcon, key: 'photo' },
];

export async function MaterialsTeaserSection({
  counts,
  section,
  locale,
}: {
  counts: MaterialCounts;
  section?: HomeSectionView;
  locale: Locale;
}) {
  const [t, tMaterials] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'materials' }),
  ]);

  const available = TYPES.filter((item) => counts[item.type] > 0);
  if (available.length === 0) return null;

  return (
    <Section id="materials" tone="paper">
      <SectionHeader
        eyebrow={section?.eyebrow ?? undefined}
        title={section?.title ?? t('sectionMaterials')}
        subtitle={section?.subtitle ?? undefined}
      />
      <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {available.map(({ type, slug, icon: TypeIcon, key }) => (
          <RevealItem as="li" key={type}>
            <Link
              href={`/materials/${slug}`}
              className="group flex h-full flex-col gap-3 rounded-lg border border-ink-300/40 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand-500"
            >
              <span className="grid size-12 place-items-center rounded-md bg-brand-50 text-brand-600">
                <TypeIcon className="size-6" aria-hidden />
              </span>
              <h3 className="text-lg">{tMaterials(key)}</h3>
              <p className="mt-auto text-sm font-semibold text-ink-600 tabular-nums">
                {counts[type]}
              </p>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
