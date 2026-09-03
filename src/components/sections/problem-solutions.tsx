'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CtaButton } from '@/components/shared/cta-button';
import { Icon } from '@/components/shared/icon';
import { cn } from '@/lib/utils';
import type { ProblemView, SkillKey } from '@/types/content';

const SKILL_ORDER: SkillKey[] = ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'GRANT'];

/** Problem → solution mapping with skill filter chips (PROMPT.md §2, /parents-solutions). */
export function ProblemSolutionTabs({ problems }: { problems: ProblemView[] }) {
  const t = useTranslations('pages');
  const tSkills = useTranslations('skills');
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const [skill, setSkill] = useState<SkillKey | 'ALL'>('ALL');

  const skills = useMemo(() => {
    const present = new Set(
      problems.map((problem) => problem.solution?.skill).filter(Boolean) as SkillKey[],
    );
    return SKILL_ORDER.filter((item) => present.has(item));
  }, [problems]);

  const visible = problems.filter(
    (problem) => skill === 'ALL' || problem.solution?.skill === skill,
  );

  if (problems.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {skills.length > 1 ? (
        <div role="tablist" aria-label={t('solution')} className="flex flex-wrap gap-2">
          {(['ALL', ...skills] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={skill === item}
              onClick={() => setSkill(item)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                skill === item
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-300/60 text-ink-600 hover:border-ink-900',
              )}
            >
              {item === 'ALL' ? tCommon('all') : tSkills(item)}
            </button>
          ))}
        </div>
      ) : null}

      <ul className="flex flex-col gap-5">
        {visible.map((problem) => (
          <li
            key={problem.id}
            className="grid gap-6 overflow-hidden rounded-lg border border-ink-300/40 bg-white p-6 shadow-card md:grid-cols-2 md:p-8"
          >
            <div className="flex flex-col gap-3">
              <Badge variant="outline">{t('problem')}</Badge>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-md bg-ink-900 text-white">
                  <Icon name={problem.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg md:text-xl">{problem.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-600">{problem.description}</p>
                </div>
              </div>
            </div>

            {problem.solution ? (
              <div className="flex flex-col gap-3 rounded-md bg-brand-50 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">{t('solution')}</Badge>
                  <Badge variant="outline">{tSkills(problem.solution.skill)}</Badge>
                </div>
                <h4 className="text-base md:text-lg">{problem.solution.title}</h4>
                <p className="text-sm text-ink-600">{problem.solution.description}</p>
                {problem.solution.imageUrl ? (
                  <div className="relative mt-2 aspect-16/9 overflow-hidden rounded-sm">
                    <Image
                      src={problem.solution.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 480px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <CtaButton source="OTHER" size="sm" className="mt-auto self-start">
                  {tHome('heroCta')}
                  <ArrowRight aria-hidden />
                </CtaButton>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
