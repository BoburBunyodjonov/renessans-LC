import { matchesAcceptedAnswer } from '@/lib/answer-match';
import type { TestAnswerInput } from '@/lib/validations/test';

export type AnswerKeyQuestion = {
  id: string;
  points: number;
  answerType: 'CHOICE' | 'TEXT';
  options: { id: string; isCorrect: boolean }[];
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
