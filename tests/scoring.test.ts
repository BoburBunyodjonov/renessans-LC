import { describe, expect, it } from 'vitest';
import { findBand, scoreAttempt, type AnswerKeyQuestion } from '@/server/services/test-scoring';

const key: AnswerKeyQuestion[] = [
  {
    id: 'q1',
    points: 1,
    options: [
      { id: 'a1', isCorrect: true },
      { id: 'a2', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    points: 1,
    options: [
      { id: 'b1', isCorrect: false },
      { id: 'b2', isCorrect: true },
    ],
  },
  {
    id: 'q3',
    points: 2,
    options: [
      { id: 'c1', isCorrect: true },
      { id: 'c2', isCorrect: false },
    ],
  },
];

describe('scoreAttempt', () => {
  it('scores correct answers and honours per-question points', () => {
    const result = scoreAttempt(key, [
      { questionId: 'q1', optionId: 'a1' },
      { questionId: 'q2', optionId: 'b1' },
      { questionId: 'q3', optionId: 'c1' },
    ]);

    expect(result.score).toBe(3); // 1 + 0 + 2
    expect(result.correctCount).toBe(2);
    expect(result.maxScore).toBe(4);
    expect(result.questionCount).toBe(3);
  });

  it('returns zero for an empty submission', () => {
    const result = scoreAttempt(key, []);
    expect(result.score).toBe(0);
    expect(result.graded).toHaveLength(0);
    expect(result.maxScore).toBe(4);
  });

  it('ignores unknown questions', () => {
    const result = scoreAttempt(key, [{ questionId: 'nope', optionId: 'a1' }]);
    expect(result.graded).toHaveLength(0);
    expect(result.score).toBe(0);
  });

  it('ignores an option that belongs to another question', () => {
    // Answering q1 with q2's correct option must not earn a point.
    const result = scoreAttempt(key, [{ questionId: 'q1', optionId: 'b2' }]);
    expect(result.graded).toHaveLength(0);
    expect(result.score).toBe(0);
  });

  it('grades nothing when every option id is unknown', () => {
    // What a visitor on a cached page sends after the question bank is rebuilt;
    // the submit route turns this into a 409 rather than storing a silent 0.
    const result = scoreAttempt(key, [
      { questionId: 'q1', optionId: 'stale-1' },
      { questionId: 'q2', optionId: 'stale-2' },
    ]);
    expect(result.graded).toHaveLength(0);
    expect(result.score).toBe(0);
  });

  it('counts a question only once when it is answered twice', () => {
    const result = scoreAttempt(key, [
      { questionId: 'q1', optionId: 'a1' },
      { questionId: 'q1', optionId: 'a1' },
    ]);
    expect(result.graded).toHaveLength(1);
    expect(result.score).toBe(1);
  });
});

describe('findBand', () => {
  const bands = [
    { id: 'low', minScore: 0, maxScore: 9, levelName: 'Beginner' },
    { id: 'mid', minScore: 10, maxScore: 18, levelName: 'Elementary' },
    { id: 'high', minScore: 19, maxScore: 45, levelName: 'Advanced' },
  ];

  it('matches inclusively on both edges', () => {
    expect(findBand(bands, 0)?.id).toBe('low');
    expect(findBand(bands, 9)?.id).toBe('low');
    expect(findBand(bands, 10)?.id).toBe('mid');
    expect(findBand(bands, 18)?.id).toBe('mid');
    expect(findBand(bands, 19)?.id).toBe('high');
  });

  it('clamps a score above every band to the highest one', () => {
    expect(findBand(bands, 999)?.id).toBe('high');
  });

  it('clamps a score below every band to the lowest one', () => {
    expect(findBand([{ id: 'only', minScore: 5, maxScore: 10, levelName: 'X' }], 1)?.id).toBe(
      'only',
    );
  });

  it('prefers the narrowest band when ranges overlap', () => {
    const overlapping = [
      { id: 'wide', minScore: 0, maxScore: 45, levelName: 'Wide' },
      { id: 'narrow', minScore: 10, maxScore: 12, levelName: 'Narrow' },
    ];
    expect(findBand(overlapping, 11)?.id).toBe('narrow');
  });

  it('returns null when there are no bands', () => {
    expect(findBand([], 5)).toBeNull();
  });
});
