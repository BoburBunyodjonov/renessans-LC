import { Section, SectionHeader } from '@/components/ui/section';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { Icon } from '@/components/shared/icon';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { HomeSectionView, ProblemView } from '@/types/content';

export function ProblemsSection({
  problems,
  section,
  fallbackTitle,
}: {
  problems: ProblemView[];
  section?: HomeSectionView;
  fallbackTitle: string;
}) {
  if (problems.length === 0) return null;

  return (
    <Section id="problems" tone="ink">
      <SectionHeader
        eyebrow={section?.eyebrow ?? undefined}
        title={section?.title ?? fallbackTitle}
        subtitle={section?.subtitle ?? undefined}
        tone="dark"
      />
      <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <RevealItem
            as="li"
            key={problem.id}
            className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-6"
          >
            <span className="grid size-11 place-items-center rounded-md bg-brand-600 text-white">
              <Icon name={problem.icon} className="size-5" />
            </span>
            <h3 className="text-base text-white md:text-lg">{problem.title}</h3>
            <p className="text-sm text-white/70">{problem.description}</p>
          </RevealItem>
        ))}
      </RevealGroup>

      {section?.ctaLabel && section.ctaHref ? (
        <div className="mt-10 flex justify-center">
          <Button variant="brand" size="lg" asChild>
            <Link href={section.ctaHref}>{section.ctaLabel}</Link>
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
