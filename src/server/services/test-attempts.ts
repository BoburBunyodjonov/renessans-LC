import { prisma } from '@/lib/prisma';
import { notify, telegramLines } from '@/lib/telegram';
import { absoluteUrl } from '@/lib/utils';
import { loc } from '@/lib/localize';
import { getAnswerKey, getTestBands } from '@/server/queries/tests';
import { createLead } from '@/server/services/leads';
import { findBand, scoreAttempt, tallyProfile } from '@/server/services/test-scoring';
import type { TestSubmitPayload } from '@/lib/validations/test';
import type { CourseCardView } from '@/types/content';
import type { Locale } from '@/types/i18n';

/** Returned when the submitted option ids match no current question. */
export type StaleAttempt = { stale: true };

export type AttemptResult = {
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
    course: CourseCardView | null;
  } | null;
};

/**
 * Grades an attempt, stores it, and — when contact details were given — creates
 * the lead and links it to the attempt (PROMPT.md §8).
 */
export async function submitAttempt(
  slug: string,
  payload: TestSubmitPayload,
  meta: { ipHash?: string; userAgent?: string } = {},
): Promise<AttemptResult | StaleAttempt | null> {
  const category = await prisma.testCategory.findFirst({
    where: { slug, isPublished: true },
    select: { id: true, title: true, requireContact: true, resultMode: true },
  });
  if (!category) return null;

  const [key, bands] = await Promise.all([
    getAnswerKey(slug),
    getTestBands(slug, payload.locale as Locale),
  ]);
  if (key.length === 0) return null;

  // A questionnaire has no right answers: it is read as a profile, and the band
  // is chosen by the commonest key rather than by a score.
  const isProfile = category.resultMode === 'PROFILE';

  const profileResult = isProfile
    ? tallyProfile(
        key,
        payload.answers,
        bands.map((item) => item.profileKey).filter((item): item is string => Boolean(item)),
      )
    : null;

  const scored = isProfile ? null : scoreAttempt(key, payload.answers);

  const graded = profileResult ? profileResult.graded : scored!.graded;
  const questionCount = profileResult ? profileResult.questionCount : scored!.questionCount;
  // For a profile the "score" is how many answers landed on the winning key,
  // which keeps the stored attempt readable next to a scored one.
  const score = profileResult ? (profileResult.tally[0]?.count ?? 0) : scored!.score;
  const maxScore = profileResult ? profileResult.questionCount : scored!.maxScore;
  const correctCount = profileResult ? profileResult.answered : scored!.correctCount;

  // Every answer referenced an option that no longer exists — the visitor is
  // holding a cached page from before the question bank changed. Storing this
  // would record a silent 0, so ask them to reload instead.
  if (payload.answers.length > 0 && graded.length === 0) {
    return { stale: true };
  }

  const band = profileResult
    ? (bands.find((item) => item.profileKey === profileResult.topKey) ?? null)
    : findBand(bands, score);

  // Contact details are optional at the schema level; when present they become a
  // lead so the attempt shows up in the same pipeline as every other enquiry.
  let leadId: string | null = null;
  if (payload.name && payload.phone) {
    const lead = await createLead(
      {
        name: payload.name,
        phone: payload.phone,
        email: undefined,
        courseId: band?.course?.id,
        message: undefined,
        preferredTime: undefined,
        source: 'TEST_RESULT',
        locale: payload.locale,
        page: payload.page,
        referrer: payload.referrer,
        utmSource: payload.utmSource,
        utmMedium: payload.utmMedium,
        utmCampaign: payload.utmCampaign,
        utmContent: payload.utmContent,
        utmTerm: payload.utmTerm,
        hp: undefined,
      },
      meta,
    );
    leadId = lead.id;
  }

  const attempt = await prisma.testAttempt.create({
    data: {
      categoryId: category.id,
      name: payload.name ?? null,
      phone: payload.phone ?? null,
      answers: graded,
      profile: profileResult
        ? profileResult.tally.map((item) => ({
            ...item,
            label: bands.find((band) => band.profileKey === item.key)?.levelName ?? item.key,
          }))
        : undefined,
      score,
      maxScore,
      bandId: band?.id ?? null,
      levelName: band?.levelName ?? null,
      durationSec: payload.durationSec ?? null,
      locale: payload.locale,
      utm: {
        source: payload.utmSource ?? null,
        medium: payload.utmMedium ?? null,
        campaign: payload.utmCampaign ?? null,
        content: payload.utmContent ?? null,
        term: payload.utmTerm ?? null,
      },
      ipHash: meta.ipHash ?? null,
      // A lead can only ever be linked to one attempt (unique FK); a repeat
      // submission from the same phone therefore stores the attempt unlinked.
      leadId: leadId && !(await attemptExistsForLead(leadId)) ? leadId : null,
    },
    select: { id: true },
  });

  notify(
    `🎯 <b>Test yakunlandi</b>\n\n${telegramLines([
      ['Yo‘nalish', loc(category.title, payload.locale as Locale)],
      ['Ism', payload.name],
      ['Telefon', payload.phone],
      ['Natija', isProfile ? (band?.levelName ?? '—') : `${score}/${maxScore}`],
      ['Daraja', band?.levelName],
      ['Tavsiya', band?.course?.title],
      ['Til', payload.locale],
    ])}\n\n${absoluteUrl('/admin/tests/attempts')}`,
    { kind: 'test' },
  );

  return {
    attemptId: attempt.id,
    score,
    maxScore,
    correctCount,
    questionCount,
    // Present only for questionnaires; the result screen shows the shares.
    profile:
      profileResult?.tally.map((item) => ({
        ...item,
        label: bands.find((band) => band.profileKey === item.key)?.levelName ?? item.key,
      })) ?? null,
    band: band
      ? {
          levelName: band.levelName,
          title: band.title,
          description: band.description,
          course: band.course,
        }
      : null,
  };
}

async function attemptExistsForLead(leadId: string): Promise<boolean> {
  const existing = await prisma.testAttempt.findUnique({
    where: { leadId },
    select: { id: true },
  });
  return existing !== null;
}
