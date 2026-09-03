import { Section, SectionHeader } from '@/components/ui/section';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { Icon } from '@/components/shared/icon';
import type { AdvantageView, HomeSectionView } from '@/types/content';

export function AdvantagesSection({
  advantages,
  section,
  fallbackTitle,
}: {
  advantages: AdvantageView[];
  section?: HomeSectionView;
  fallbackTitle: string;
}) {
  if (advantages.length === 0) return null;

  return (
    <Section id="advantages" tone="paper">
      <SectionHeader
        eyebrow={section?.eyebrow ?? undefined}
        title={section?.title ?? fallbackTitle}
        subtitle={section?.subtitle ?? undefined}
      />
      <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {advantages.map((advantage, index) => (
          <RevealItem
            as="li"
            key={advantage.id}
            className="group relative flex flex-col gap-3 rounded-lg border border-ink-300/40 bg-white p-6 shadow-card transition-transform hover:-translate-y-1 md:p-7"
          >
            <span className="grid size-12 place-items-center rounded-md bg-brand-50 text-brand-600">
              <Icon name={advantage.icon} className="size-6" />
            </span>
            <span
              aria-hidden
              className="absolute end-5 top-4 font-display text-4xl font-extrabold text-ink-100 tabular-nums"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-lg md:text-xl">{advantage.title}</h3>
            <p className="text-sm text-ink-600 md:text-base">{advantage.description}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
