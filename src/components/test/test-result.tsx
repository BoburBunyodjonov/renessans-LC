'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, RotateCcw, Share2, Trophy } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CtaButton } from '@/components/shared/cta-button';
import { Link } from '@/i18n/navigation';
import { absoluteUrl } from '@/lib/utils';
import type { AttemptResultView } from '@/components/test/test-runner';

export function TestResult({
  slug,
  result,
  followUps,
  onRetake,
}: {
  slug: string;
  result: AttemptResultView;
  followUps: { slug: string; title: string; subtitle: string | null }[];
  onRetake: () => void;
}) {
  const t = useTranslations('test');
  const tCommon = useTranslations('common');
  const percent = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;

  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    absoluteUrl(`/uz/tests/${slug}`),
  )}&text=${encodeURIComponent(t('shareText', { score: result.score, max: result.maxScore }))}`;

  const profile = result.profile;

  return (
    <Container className="max-w-3xl py-12 md:py-16">
      {profile ? (
        // A questionnaire has no mark out of ten; the shares are the result.
        <div className="flex flex-col gap-5 rounded-lg bg-brand-600 p-8 text-white shadow-brand md:p-10">
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.18em] uppercase">{t('resultTitle')}</p>
            {result.band ? (
              <p className="mt-2 font-display text-3xl leading-tight font-extrabold md:text-4xl">
                {result.band.title}
              </p>
            ) : null}
          </div>

          <ul className="flex flex-col gap-2.5">
            {profile.map((item) => (
              <li key={item.key} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-semibold md:w-32">{item.label}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/25">
                  <span
                    className="block h-full rounded-full bg-white"
                    style={{ width: `${item.percent}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-end text-sm font-bold tabular-nums">
                  {item.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg bg-brand-600 p-8 text-center text-white shadow-brand md:p-12">
          <Trophy className="size-10" aria-hidden />
          <p className="text-xs font-bold tracking-[0.18em] uppercase">{t('resultTitle')}</p>
          <p className="font-display text-6xl leading-none font-extrabold tabular-nums md:text-7xl">
            {result.score}
            <span className="text-3xl md:text-4xl">/{result.maxScore}</span>
          </p>
          <div
            className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-black/25"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-sm">
            {t('correctAnswers')}: {result.correctCount}/{result.questionCount}
          </p>
        </div>
      )}

      {result.band ? (
        <div className="mt-6 rounded-lg border border-ink-300/40 bg-white p-6 shadow-card md:p-8">
          <Badge variant="brand" size="md">
            {profile ? t('whatItMeans') : t('yourLevel')}
          </Badge>
          {/* A questionnaire already names the profile in the panel above, so
              repeating the title and the level here would say it three times. */}
          {profile ? null : (
            <>
              <h1 className="mt-4 text-2xl md:text-3xl">{result.band.title}</h1>
              <p className="mt-1 font-semibold text-brand-600">{result.band.levelName}</p>
            </>
          )}
          <p className="mt-4 text-ink-600">{result.band.description}</p>

          {result.band.course ? (
            <div className="mt-6 flex flex-col gap-3 rounded-md bg-paper-alt p-5">
              <p className="text-xs font-bold tracking-[0.16em] text-ink-600 uppercase">
                {t('recommendedCourse')}
              </p>
              <p className="font-display text-xl font-extrabold text-ink-900">
                {result.band.course.title}
              </p>
              <div className="flex flex-wrap gap-3">
                <CtaButton source="TEST_RESULT" courseId={result.band.course.id} size="md">
                  {tCommon('continue')}
                  <ArrowRight aria-hidden />
                </CtaButton>
                {result.band.course.hasDetailPage ? (
                  <Button variant="ghost" asChild>
                    <Link href={`/courses/${result.band.course.slug}`}>{tCommon('readMore')}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {followUps.length > 0 ? (
        // Offered once the placement paper is done: two short questionnaires
        // that say how the student learns rather than how much they know.
        <div className="mt-6 rounded-lg border border-ink-300/40 bg-white p-6 shadow-card md:p-8">
          <p className="text-xs font-bold tracking-[0.16em] text-ink-600 uppercase">
            {t('followUpTitle')}
          </p>
          <p className="mt-2 text-ink-600">{t('followUpIntro')}</p>

          <ul className="mt-5 flex flex-col gap-3">
            {followUps.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/tests/${item.slug}`}
                  className="flex items-center gap-4 rounded-2xl border-2 border-ink-300/60 px-4 py-3.5 transition-colors hover:border-brand-600/50 hover:bg-brand-50/40 md:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-extrabold text-ink-900">
                      {item.title}
                    </span>
                    {item.subtitle ? (
                      <span className="mt-0.5 block text-sm text-ink-600">{item.subtitle}</span>
                    ) : null}
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-brand-600" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" asChild>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            <Share2 aria-hidden />
            {t('shareResult')}
          </a>
        </Button>
        <Button variant="ghost" onClick={onRetake}>
          <RotateCcw aria-hidden />
          {t('retake')}
        </Button>
      </div>
    </Container>
  );
}
