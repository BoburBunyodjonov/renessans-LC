'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { CtaButton } from '@/components/shared/cta-button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { HeroSlideView, StatView } from '@/types/content';

const AUTOPLAY_MS = 7000;

export function HeroSection({
  slides,
  stats,
  fallbackCtaLabel,
  fallbackCtaHref,
}: {
  slides: HeroSlideView[];
  stats: StatView[];
  fallbackCtaLabel: string;
  fallbackCtaHref: string;
}) {
  const t = useTranslations('common');
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || reduced) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, reduced]);

  if (slides.length === 0) return null;
  const slide = slides[Math.min(index, slides.length - 1)]!;
  const ctaLabel = slide.ctaLabel ?? fallbackCtaLabel;
  const ctaHref = slide.ctaHref ?? fallbackCtaHref;
  const opensModal = !ctaHref || ctaHref.startsWith('#');

  return (
    <section className="relative overflow-hidden bg-brand-600 text-white">
      {/* Outlined-logo watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-32 -top-40 size-[34rem] rounded-full border-[4rem] border-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -start-24 -bottom-48 size-[26rem] rounded-full border-[3rem] border-white/5"
      />

      <Container className="relative z-10 grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24">
        <div>
          {/* No entrance animation on the first slide: the H1 is the mobile LCP
              element, so it must paint with the HTML and never start at opacity 0.
              Later slides fade in via CSS. */}
          <div key={slide.id} className={index === 0 ? undefined : 'animate-hero-slide'}>
            <h1
              className="hero-title text-white"
              // Headlines are localized HTML-lite: only <mark> is used, authored in the admin.
              dangerouslySetInnerHTML={{ __html: slide.headline }}
            />
            {slide.subtitle ? (
              <p className="mt-5 max-w-xl text-base text-white md:text-lg lg:text-xl">
                {slide.subtitle}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {opensModal ? (
              <CtaButton source="HERO" variant="white" size="lg">
                {ctaLabel}
                <ArrowRight aria-hidden />
              </CtaButton>
            ) : (
              <Button variant="white" size="lg" asChild>
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            )}

            {slides.length > 1 ? (
              <div className="flex items-center gap-2" role="tablist" aria-label={t('menu')}>
                {slides.map((item, slideIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={slideIndex === index}
                    aria-label={`${slideIndex + 1}`}
                    onClick={() => setIndex(slideIndex)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      slideIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70',
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Desktop-only media: on mobile the headline is the LCP element, which
            keeps the largest paint text-fast on a mid-range Android. */}
        {slide.imageUrl ? (
          <div className="relative hidden aspect-3/4 max-h-[30rem] w-full overflow-hidden rounded-lg shadow-2xl lg:block">
            <Image
              src={slide.imageUrl}
              alt={slide.imageAlt ?? ''}
              fill
              quality={72}
              sizes="480px"
              className="object-cover"
              // No `priority`: the element is hidden below `lg`, so preloading it
              // would put a desktop-only image on every phone's critical path.
            />
          </div>
        ) : null}
      </Container>

      {stats.length > 0 ? (
        <Container className="relative z-10 pb-12 md:pb-16">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((stat) => (
              <li key={stat.id} className="rounded-md bg-black/20 px-4 py-4 md:px-5 md:py-5">
                <p className="font-display text-2xl font-extrabold tabular-nums md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-white md:text-sm">{stat.label}</p>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
    </section>
  );
}
