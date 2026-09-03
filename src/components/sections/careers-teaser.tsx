import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/shared/reveal';
import { Link } from '@/i18n/navigation';
import type { HomeSectionView } from '@/types/content';

export function CareersTeaserSection({ section }: { section: HomeSectionView }) {
  if (!section.title) return null;

  return (
    <section className="relative overflow-hidden bg-ink-900 py-16 text-white md:py-24">
      {section.imageUrl ? (
        <Image
          src={section.imageUrl}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink-900/95 to-ink-900/60"
      />

      <Container className="relative z-10">
        <Reveal className="max-w-2xl">
          {section.eyebrow ? (
            <p className="text-xs font-bold tracking-[0.18em] text-brand-500 uppercase">
              {section.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-3xl text-white md:text-4xl lg:text-5xl">{section.title}</h2>
          {section.subtitle ? (
            <p className="mt-4 text-base text-white/80 md:text-lg">{section.subtitle}</p>
          ) : null}
          {section.ctaLabel && section.ctaHref ? (
            <Button variant="brand" size="lg" asChild className="mt-8">
              <Link href={section.ctaHref}>
                {section.ctaLabel}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
