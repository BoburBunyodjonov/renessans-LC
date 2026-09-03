import Image from 'next/image';
import { Section, SectionHeader } from '@/components/ui/section';
import { Reveal } from '@/components/shared/reveal';
import { LiteYouTube } from '@/components/shared/lite-youtube';
import type { HomeSectionView } from '@/types/content';

export function AboutSection({ section }: { section: HomeSectionView }) {
  if (!section.title && !section.body) return null;

  return (
    <Section id="about" tone="alt">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeader
            eyebrow={section.eyebrow ?? undefined}
            title={section.title ?? ''}
            subtitle={section.subtitle ?? undefined}
            className="mb-6 md:mb-8"
          />
          {section.body ? (
            <div
              className="prose-brand flex flex-col gap-4 text-base text-ink-600 md:text-lg"
              // Rich text authored in the admin (sanitized on save).
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          ) : null}
        </Reveal>

        <Reveal delay={0.1}>
          {section.videoUrl ? (
            <LiteYouTube
              url={section.videoUrl}
              title={section.title ?? ''}
              poster={section.imageUrl}
            />
          ) : section.imageUrl ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-lg">
              <Image
                src={section.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </Reveal>
      </div>
    </Section>
  );
}
