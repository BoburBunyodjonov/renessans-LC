import { matchesAcceptedAnswer } from '@/lib/answer-match';
import type { TestAnswerInput } from '@/lib/validations/test';

export type AnswerKeyQuestion = {
  id: string;
  points: number;
  answerType: 'CHOICE' | 'TEXT';
  options: { id: string; isCorrect: boolean; profileKey?: string | null }[];
  acceptedAnswers: string[];
};

export type GradedAnswer = {
  questionId: string;
  /** Present for CHOICE questions. */
  optionId?: string;
  /** What the visitor typed, kept so an admin can read the paper back. */
  text?: string;
  isCorrect: boolean;
};

export type ScoreResult = {
  graded: GradedAnswer[];
  score: number;
  maxScore: number;
  correctCount: number;
  questionCount: number;
};

export type ProfileTally = { key: string; count: number; percent: number };

export type ProfileResult = {
  graded: GradedAnswer[];
  /** Every profile that was offered, commonest first. */
  tally: ProfileTally[];
  /** The commonest profile, or null when nothing was answered. */
  topKey: string | null;
  answered: number;
  questionCount: number;
};

/**
 * Reads a questionnaire as a profile rather than a score: each answer counts
 * towards its option's key, and the commonest key wins.
 *
 * A tie is broken by the order the keys appear in the paper, which is what a
 * person marking by hand does when two columns come out level — it keeps the
 * result stable rather than dependent on map iteration order.
 */
export function tallyProfile(
  key: AnswerKeyQuestion[],
  answers: TestAnswerInput[],
  keyOrder: string[],
): ProfileResult {
  const byQuestion = new Map(key.map((question) => [question.id, question]));
  const seen = new Set<string>();
  const graded: GradedAnswer[] = [];
  const counts = new Map<string, number>(keyOrder.map((profile) => [profile, 0]));

  let answered = 0;

  for (const answer of answers) {
    const question = byQuestion.get(answer.questionId);
    if (!question || seen.has(answer.questionId)) continue;

    const option = question.options.find((item) => item.id === answer.optionId);
    if (!option) continue;
    seen.add(answer.questionId);

    graded.push({ questionId: question.id, optionId: option.id, isCorrect: false });
    answered += 1;

    const profile = option.profileKey;
    if (profile) counts.set(profile, (counts.get(profile) ?? 0) + 1);
  }

  const tally: ProfileTally[] = keyOrder.map((profile) => ({
    key: profile,
    count: counts.get(profile) ?? 0,
    // The paper says: multiply each count by ten. With ten questions that is a
    // percentage; expressed as a share it stays right for any length.
    percent: key.length > 0 ? Math.round(((counts.get(profile) ?? 0) / key.length) * 100) : 0,
  }));

  const ranked = [...tally].sort((a, b) => b.count - a.count);
  const top = ranked[0];

  return {
    graded,
    tally: ranked,
    topKey: top && top.count > 0 ? top.key : null,
    answered,
    questionCount: key.length,
  };
}

/**
 * Pure scoring pass — no I/O, so it can be unit tested directly.
 * Unknown questions and options that do not belong to their question are
 * ignored rather than counted, and each question is graded at most once.
 */
export function scoreAttempt(key: AnswerKeyQuestion[], answers: TestAnswerInput[]): ScoreResult {
  const byQuestion = new Map(key.map((question) => [question.id, question]));
  const seen = new Set<string>();
  const graded: GradedAnswer[] = [];

  let score = 0;
  let correctCount = 0;

  for (const answer of answers) {
    const question = byQuestion.get(answer.questionId);
    if (!question || seen.has(answer.questionId)) continue;
    seen.add(answer.questionId);

    let isCorrect: boolean;
    if (question.answerType === 'TEXT') {
      // A blank is simply wrong; storing it keeps the attempt readable.
      const text = answer.text ?? '';
      isCorrect = matchesAcceptedAnswer(text, question.acceptedAnswers);
      graded.push({ questionId: question.id, text, isCorrect });
    } else {
      const option = question.options.find((item) => item.id === answer.optionId);
      // An option that does not belong to this question is not an answer.
      if (!option) {
        seen.delete(question.id);
        continue;
      }
      isCorrect = option.isCorrect;
      graded.push({ questionId: question.id, optionId: option.id, isCorrect });
    }

    if (isCorrect) {
      score += question.points;
      correctCount += 1;
    }
  }

  return {
    graded,
    score,
    correctCount,
    questionCount: key.length,
    maxScore: key.reduce((total, question) => total + question.points, 0),
  };
}

export type BandLike = { id: string; minScore: number; maxScore: number; levelName: string };

/**
 * Picks the band whose range contains the score. Ranges are inclusive; when
 * they overlap the narrowest match wins, and a score above every band falls
 * back to the highest one.
 */
export function findBand<T extends BandLike>(bands: T[], score: number): T | null {
  if (bands.length === 0) return null;

  const matches = bands.filter((band) => score >= band.minScore && score <= band.maxScore);
  if (matches.length > 0) {
    return matches.reduce((best, band) =>
      band.maxScore - band.minScore < best.maxScore - best.minScore ? band : best,
    );
  }

  const sorted = [...bands].sort((a, b) => a.minScore - b.minScore);
  return score < sorted[0]!.minScore ? sorted[0]! : sorted[sorted.length - 1]!;
}
