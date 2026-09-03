'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Section, SectionHeader } from '@/components/ui/section';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import type { HomeSectionView, StatView } from '@/types/content';

/** Splits `2 500+` into its numeric part and the surrounding characters. */
function parseValue(value: string) {
  const match = value.match(/^(\D*)([\d\s  .,]+)(.*)$/);
  if (!match) return null;
  const digits = Number(match[2]!.replace(/[^\d]/g, ''));
  if (!Number.isFinite(digits)) return null;
  return { prefix: match[1] ?? '', target: digits, suffix: match[3] ?? '', raw: value };
}

function CountUp({ value }: { value: string }) {
  // Memoised: parsing in the render body produced a new object on every frame,
  // which re-ran the effect and started a fresh animation each time — the
  // competing loops kept resetting the number instead of finishing.
  const parsed = useMemo(() => parseValue(value), [value]);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    if (!parsed || reduced || started.current) return;
    const node = ref.current;
    if (!node) return;

    let frame = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(parsed.target * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [parsed, reduced]);

  if (!parsed || reduced || display === null) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      {parsed.prefix}
      {new Intl.NumberFormat('fr-FR').format(display).replace(/ | /g, ' ')}
      {parsed.suffix}
    </span>
  );
}

export function StatsSection({ stats, section }: { stats: StatView[]; section?: HomeSectionView }) {
  if (stats.length === 0) return null;

  return (
    <Section tone="paper">
      {section?.title ? (
        <SectionHeader
          eyebrow={section.eyebrow ?? undefined}
          title={section.title}
          subtitle={section.subtitle ?? undefined}
        />
      ) : null}
      <RevealGroup as="ul" className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {stats.map((stat) => (
          <RevealItem as="li" key={stat.id} className="flex flex-col gap-1">
            <span className="stat-numeral text-brand-500">
              <CountUp value={stat.value} />
            </span>
            <span className="text-sm font-medium text-ink-600 md:text-base">{stat.label}</span>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
