'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Check, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { ContactGate } from '@/components/test/contact-gate';
import { TestResult } from '@/components/test/test-result';
import type { TestRunnerView } from '@/types/content';

type Answers = Record<string, string>;

type StoredProgress = {
  attemptId: string;
  answers: Answers;
  index: number;
  startedAt: number;
};

export type AttemptResultView = {
  attemptId: string;
  score: number;
  maxScore: number;
  correctCount: number;
  questionCount: number;
  /** Questionnaires only: every profile with its share, commonest first. */
  profile: { key: string; label: string; count: number; percent: number }[] | null;
  band: {
    levelName: string;
    title: string;
    description: string;
    course: { id: string; slug: string; title: string; hasDetailPage: boolean } | null;
  } | null;
};

type Stage = 'quiz' | 'gate' | 'result';

const storageKey = (slug: string) => `placement-test:${slug}`;

function readProgress(slug: string): StoredProgress | null {
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredProgress;
    if (!parsed?.attemptId || typeof parsed.index !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * One question per screen, progress kept in localStorage so a refresh resumes,
 * optional countdown with auto-submit, and 1–5 / Enter keyboard control
 * (PROMPT.md §8).
 */
export function TestRunner({
  slug,
  runner,
  startLabel,
}: {
  slug: string;
  runner: TestRunnerView;
  startLabel: string;
}) {
  const t = useTranslations('test');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const questions = useMemo(() => {
    if (!runner.shuffle) return runner.questions;
    // Deterministic per mount, so a resume keeps the same order within a session.
    return [...runner.questions].sort(() => Math.random() - 0.5);
  }, [runner.questions, runner.shuffle]);

  const [progress, setProgress] = useState<StoredProgress | null>(null);
  const [resumable, setResumable] = useState<StoredProgress | null>(null);
  const [stage, setStage] = useState<Stage>('quiz');
  const [result, setResult] = useState<AttemptResultView | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [stale, setStale] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const submitted = useRef(false);

  // ---- restore or start -------------------------------------------------
  useEffect(() => {
    const stored = readProgress(slug);
    if (stored && Object.keys(stored.answers).length > 0) {
      setResumable(stored);
      return;
    }
    startFresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const startFresh = useCallback(() => {
    const fresh: StoredProgress = {
      attemptId:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
      answers: {},
      index: 0,
      startedAt: Date.now(),
    };
    setProgress(fresh);
    setResumable(null);
    setStage('quiz');
    setResult(null);
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(fresh));
    } catch {
      // Private mode — the run still works, it just cannot be resumed.
    }
    track('test_started', { slug });
  }, [slug]);

  // ---- persist ----------------------------------------------------------
  useEffect(() => {
    if (!progress) return;
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress, slug]);

  const answeredCount = progress ? Object.keys(progress.answers).length : 0;
  const index = progress?.index ?? 0;
  const question = questions[Math.min(index, questions.length - 1)];
  const selected = question && progress ? progress.answers[question.id] : undefined;
  const isLast = index >= questions.length - 1;

  // ---- submit -----------------------------------------------------------
  const submit = useCallback(
    async (contact?: { name: string; phone: string }) => {
      if (!progress || submitted.current) return;
      submitted.current = true;
      setSubmitting(true);
      setError(false);

      const params = new URLSearchParams(window.location.search);
      try {
        const response = await fetch(`/api/test/${slug}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: Object.entries(progress.answers).map(([questionId, value]) => {
              const answered = runner.questions.find((item) => item.id === questionId);
              return answered?.answerType === 'TEXT'
                ? { questionId, text: value }
                : { questionId, optionId: value };
            }),
            name: contact?.name,
            phone: contact?.phone,
            durationSec: Math.round((Date.now() - progress.startedAt) / 1000),
            locale,
            page: window.location.pathname,
            referrer: document.referrer || undefined,
            utmSource: params.get('utm_source') ?? undefined,
            utmMedium: params.get('utm_medium') ?? undefined,
            utmCampaign: params.get('utm_campaign') ?? undefined,
            utmContent: params.get('utm_content') ?? undefined,
            utmTerm: params.get('utm_term') ?? undefined,
          }),
        });

        if (response.status === 409) {
          // The question bank changed under us; the stored progress is useless.
          setStale(true);
          try {
            window.localStorage.removeItem(storageKey(slug));
          } catch {
            // ignore
          }
          return;
        }
        if (!response.ok) throw new Error(String(response.status));
        const payload = (await response.json()) as { data: AttemptResultView };

        setResult(payload.data);
        setStage('result');
        track('test_completed', { slug, score: payload.data.score });
        try {
          window.localStorage.removeItem(storageKey(slug));
        } catch {
          // ignore
        }
      } catch {
        setError(true);
        submitted.current = false;
      } finally {
        setSubmitting(false);
        submitted.current = false;
      }
    },
    [locale, progress, slug, runner.questions],
  );

  const finishQuiz = useCallback(() => {
    if (runner.requireContact) {
      setStage('gate');
    } else {
      void submit();
    }
  }, [runner.requireContact, submit]);

  // ---- countdown --------------------------------------------------------
  useEffect(() => {
    if (!progress || !runner.timeLimitSec || stage !== 'quiz') return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - progress.startedAt) / 1000);
      const left = runner.timeLimitSec! - elapsed;
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        setTimedOut(true);
        finishQuiz();
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [progress, runner.timeLimitSec, stage, finishQuiz]);

  // ---- interaction ------------------------------------------------------
  const choose = useCallback(
    (optionId: string) => {
      if (!question) return;
      setProgress((current) =>
        current
          ? { ...current, answers: { ...current.answers, [question.id]: optionId } }
          : current,
      );
    },
    [question],
  );

  const goNext = useCallback(() => {
    if (!progress || !question) return;
    if (!(progress.answers[question.id] ?? '').trim()) return;
    if (isLast) {
      finishQuiz();
      return;
    }
    setProgress((current) => (current ? { ...current, index: current.index + 1 } : current));
  }, [finishQuiz, isLast, progress, question]);

  const goBack = useCallback(() => {
    if (!runner.allowBack) return;
    setProgress((current) =>
      current && current.index > 0 ? { ...current, index: current.index - 1 } : current,
    );
  }, [runner.allowBack]);

  useEffect(() => {
    if (stage !== 'quiz' || !question) return;

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (question.answerType === 'CHOICE' && /^[1-9]$/.test(event.key)) {
        const option = question.options[Number(event.key) - 1];
        if (option) {
          event.preventDefault();
          choose(option.id);
        }
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose, goNext, question, stage]);

  // ---- render -----------------------------------------------------------
  if (stale) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
        <h1 className="text-2xl md:text-3xl">{t('staleTest')}</h1>
        <Button size="lg" onClick={() => window.location.reload()}>
          {tCommon('retry')}
        </Button>
      </Container>
    );
  }

  if (resumable) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
        <h1 className="text-2xl md:text-3xl">{t('resumeTitle')}</h1>
        <p className="max-w-md text-ink-600">{t('resumeText')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            onClick={() => {
              setProgress(resumable);
              setResumable(null);
              setStage('quiz');
            }}
          >
            {t('resume')}
          </Button>
          <Button size="lg" variant="outline" onClick={startFresh}>
            {t('startOver')}
          </Button>
        </div>
      </Container>
    );
  }

  if (!progress) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-brand-600" aria-hidden />
        <span className="sr-only">{startLabel}</span>
      </Container>
    );
  }

  if (stage === 'result' && result) {
    return (
      <TestResult slug={slug} result={result} followUps={runner.followUps} onRetake={startFresh} />
    );
  }

  if (stage === 'gate') {
    return (
      <ContactGate
        submitting={submitting}
        error={error}
        skippable={!runner.requireContact}
        timedOut={timedOut}
        onSubmit={(contact) => void submit(contact)}
        onSkip={() => void submit()}
      />
    );
  }

  if (!question) return null;

  const progressPercent = Math.round(
    ((index + (selected?.trim() ? 1 : 0)) / questions.length) * 100,
  );

  return (
    <div className="pb-20">
      {/* Sticky progress + countdown */}
      <div className="sticky top-(--header-height) z-40 border-b border-ink-300/40 bg-paper/95 backdrop-blur-sm">
        <Container className="flex items-center gap-4 py-3">
          <p className="text-sm font-bold text-ink-900 tabular-nums">
            {t('progress', { current: index + 1, total: questions.length })}
          </p>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {remaining !== null ? (
            <p
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-bold tabular-nums',
                remaining < 60 ? 'text-danger' : 'text-ink-600',
              )}
            >
              <Clock className="size-4" aria-hidden />
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
            </p>
          ) : null}
        </Container>
      </div>

      <Container className="max-w-3xl py-10 md:py-14">
        <h1 className="sr-only">{runner.title}</h1>

        <div className="flex items-start gap-3">
          <span className="font-display text-2xl font-extrabold text-brand-600 tabular-nums md:text-3xl">
            {index + 1}.
          </span>
          {/* Prompts may hold a two-line dialogue and `_____` gaps. */}
          <p className="font-display text-xl leading-snug font-bold whitespace-pre-line text-ink-900 md:text-2xl">
            {question.prompt}
          </p>
        </div>

        {question.imageUrl ? (
          <div className="mt-6 flex justify-center">
            {/* The picture *is* the question, so it gets a fixed box and eager
                loading — a lazy image below the fold would leave the child
                looking at a prompt with nothing to name. */}
            <Image
              src={question.imageUrl}
              alt=""
              width={320}
              height={240}
              priority
              unoptimized
              className="max-h-[180px] w-auto object-contain md:max-h-[220px]"
            />
          </div>
        ) : null}

        {question.answerType === 'TEXT' ? (
          <div className="mt-8">
            <label htmlFor="answer" className="sr-only">
              {t('yourAnswer')}
            </label>
            <input
              id="answer"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={selected ?? ''}
              onChange={(event) => choose(event.target.value)}
              onKeyDown={(event) => {
                // Enter moves on, matching the keyboard flow of the choice
                // questions; the global handler ignores typing in inputs.
                if (event.key === 'Enter') {
                  event.preventDefault();
                  goNext();
                }
              }}
              placeholder={t('yourAnswer')}
              className="w-full rounded-2xl border-2 border-ink-300/70 bg-white px-5 py-4 text-base text-ink-900 outline-none focus:border-brand-600"
            />
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === option.id;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => choose(option.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-full border-2 px-5 py-4 text-start text-base transition-all',
                      isSelected
                        ? 'border-brand-600 bg-brand-50 font-semibold text-ink-900'
                        : 'border-ink-300/70 bg-white text-ink-600 hover:border-ink-900',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors',
                        isSelected ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600',
                      )}
                    >
                      {isSelected ? <Check className="size-4" /> : optionIndex + 1}
                    </span>
                    <span className="min-w-0 flex-1">{option.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {error ? (
          <p role="alert" className="mt-6 text-sm text-danger">
            {t('errorLoading')}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          {runner.allowBack ? (
            <Button variant="ghost" size="lg" onClick={goBack} disabled={index === 0}>
              <ArrowLeft aria-hidden />
              {t('back')}
            </Button>
          ) : (
            <span />
          )}

          <Button size="lg" onClick={goNext} disabled={!selected?.trim() || submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                {t('submitting')}
              </>
            ) : (
              <>
                {isLast ? t('finish') : t('next')}
                <ArrowRight aria-hidden />
              </>
            )}
          </Button>
        </div>

        {/* The number keys pick an option, which a typed question has none of. */}
        <p className="mt-6 hidden text-xs text-ink-600 md:block">
          {question.answerType === 'TEXT' ? t('keyboardHintText') : t('keyboardHint')}
        </p>
        <p className="mt-2 text-xs text-ink-600 tabular-nums">
          {tCommon('all')}: {answeredCount}/{questions.length}
        </p>
      </Container>
    </div>
  );
}
