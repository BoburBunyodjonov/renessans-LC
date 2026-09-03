'use client';

import { useState } from 'react';
import { Section, SectionHeader } from '@/components/ui/section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Reveal } from '@/components/shared/reveal';
import { cn } from '@/lib/utils';
import type { FaqGroupView, HomeSectionView } from '@/types/content';

export function FaqSection({
  groups,
  section,
  fallbackTitle,
}: {
  groups: FaqGroupView[];
  section?: HomeSectionView;
  fallbackTitle: string;
}) {
  const [activeGroup, setActiveGroup] = useState(0);

  if (groups.length === 0) return null;
  const showChips = groups.length > 1 && groups.every((group) => group.name);
  const visible = showChips ? [groups[Math.min(activeGroup, groups.length - 1)]!] : groups;

  return (
    <Section id="faq" tone="alt">
      <SectionHeader
        eyebrow={section?.eyebrow ?? undefined}
        title={section?.title ?? fallbackTitle}
        subtitle={section?.subtitle ?? undefined}
      />

      {showChips ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {groups.map((group, index) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroup(index)}
              aria-pressed={index === activeGroup}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                index === activeGroup
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-300/60 text-ink-600 hover:border-ink-900',
              )}
            >
              {group.name}
            </button>
          ))}
        </div>
      ) : null}

      <Reveal>
        <Accordion type="single" collapsible className="mx-auto flex max-w-3xl flex-col gap-3">
          {visible.flatMap((group) =>
            group.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            )),
          )}
        </Accordion>
      </Reveal>
    </Section>
  );
}
