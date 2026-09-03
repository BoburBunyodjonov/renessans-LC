'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Play, Star } from 'lucide-react';
import { Section, SectionHeader } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LiteYouTube } from '@/components/shared/lite-youtube';
import { colorFromString, initialsOf } from '@/lib/utils';
import type { HomeSectionView, TestimonialView } from '@/types/content';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={index < rating ? 'size-4 fill-warning text-warning' : 'size-4 text-ink-300'}
        />
      ))}
    </span>
  );
}

function Card({
  testimonial,
  onOpen,
}: {
  testimonial: TestimonialView;
  onOpen: (testimonial: TestimonialView) => void;
}) {
  const t = useTranslations('common');

  return (
    <article className="mx-2.5 flex w-[19rem] shrink-0 flex-col gap-3 rounded-lg border border-ink-300/40 bg-white p-6 shadow-card md:w-[22rem]">
      <div className="flex items-center gap-3">
        {testimonial.avatarUrl ? (
          <Image
            src={testimonial.avatarUrl}
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: colorFromString(testimonial.authorName) }}
          >
            {initialsOf(testimonial.authorName)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink-900">{testimonial.authorName}</p>
          {testimonial.authorRole ? (
            <p className="truncate text-xs text-ink-600">{testimonial.authorRole}</p>
          ) : null}
        </div>
        {testimonial.sourceLabel ? (
          <Badge variant="outline" className="ms-auto">
            {testimonial.sourceLabel}
          </Badge>
        ) : null}
      </div>

      <Stars rating={testimonial.rating} />
      <p className="line-clamp-4 text-sm text-ink-600">{testimonial.content}</p>

      <button
        type="button"
        onClick={() => onOpen(testimonial)}
        className="mt-auto inline-flex items-center gap-1.5 self-start pt-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        {testimonial.videoUrl ? <Play className="size-4" aria-hidden /> : null}
        {t('readMore')}
      </button>
    </article>
  );
}

export function TestimonialsSection({
  testimonials,
  section,
  fallbackTitle,
}: {
  testimonials: TestimonialView[];
  section?: HomeSectionView;
  fallbackTitle: string;
}) {
  const tCommon = useTranslations('common');
  const [active, setActive] = useState<TestimonialView | null>(null);

  if (testimonials.length === 0) return null;

  const half = Math.ceil(testimonials.length / 2);
  const rows =
    testimonials.length > 3
      ? [testimonials.slice(0, half), testimonials.slice(half)]
      : [testimonials];

  return (
    <Section id="testimonials" tone="alt" containerClassName="max-w-none px-0 md:px-0">
      <div className="container-site">
        <SectionHeader
          eyebrow={section?.eyebrow ?? undefined}
          title={section?.title ?? fallbackTitle}
          subtitle={section?.subtitle ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-5">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="marquee-root overflow-hidden">
            <div
              className="marquee-track"
              data-direction={rowIndex % 2 === 1 ? 'reverse' : undefined}
              style={{ '--marquee-duration': `${48 + rowIndex * 10}s` } as React.CSSProperties}
            >
              {/* The second copy exists only to make the loop seamless: it is hidden
                  from assistive tech and taken out of the tab order. */}
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="flex shrink-0"
                  aria-hidden={copy === 1}
                  inert={copy === 1}
                >
                  {row.map((testimonial) => (
                    <Card
                      key={`${copy}-${testimonial.id}`}
                      testimonial={testimonial}
                      onOpen={setActive}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent closeLabel={tCommon('close')}>
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle>{active.authorName}</DialogTitle>
                {active.authorRole ? (
                  <p className="text-sm text-ink-600">{active.authorRole}</p>
                ) : null}
              </DialogHeader>
              <Stars rating={active.rating} />
              {active.videoUrl ? (
                <LiteYouTube url={active.videoUrl} title={active.authorName} />
              ) : null}
              <p className="text-ink-600">{active.content}</p>
              {active.sourceUrl ? (
                <a
                  href={active.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-brand-600"
                >
                  {active.sourceLabel ?? active.sourceUrl}
                </a>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Section>
  );
}
