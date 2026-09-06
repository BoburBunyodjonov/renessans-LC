import { describe, expect, it } from 'vitest';
import { matchesAcceptedAnswer, normalizeAnswer } from '@/lib/answer-match';

describe('normalizeAnswer', () => {
  it('ignores what a marker would ignore', () => {
    expect(normalizeAnswer('  Car  ')).toBe('car');
    expect(normalizeAnswer('She is playing.')).toBe('she is playing');
    expect(normalizeAnswer('I like bananas!')).toBe('i like bananas');
    expect(normalizeAnswer('What does he do in the evening?')).toBe(
      'what does he do in the evening',
    );
    expect(normalizeAnswer('There  are\n5   people')).toBe('there are 5 people');
  });

  it('treats every apostrophe Uzbek is typed with as the same letter', () => {
    const forms = ["o'tirmoq", 'o‘tirmoq', 'oʻtirmoq', 'o’tirmoq', 'o`tirmoq'];
    const normalized = forms.map(normalizeAnswer);
    expect(new Set(normalized).size).toBe(1);
  });

  it('leaves a different word different', () => {
    expect(normalizeAnswer('swim')).not.toBe(normalizeAnswer('swimming'));
  });
});

describe('matchesAcceptedAnswer', () => {
  const sit = ['Сидеть', "o'tirmoq"];

  it('accepts either language a child may answer a translation in', () => {
    expect(matchesAcceptedAnswer('сидеть', sit)).toBe(true);
    expect(matchesAcceptedAnswer('Oʻtirmoq', sit)).toBe(true);
    expect(matchesAcceptedAnswer('  O‘TIRMOQ ', sit)).toBe(true);
  });

  it('accepts a short answer when the teacher listed one', () => {
    const accepted = ['Her name is Molly.', 'Molly'];
    expect(matchesAcceptedAnswer('Molly', accepted)).toBe(true);
    expect(matchesAcceptedAnswer('her name is molly', accepted)).toBe(true);
  });

  it('rejects a wrong answer', () => {
    expect(matchesAcceptedAnswer('stand', sit)).toBe(false);
    expect(matchesAcceptedAnswer('sitting', sit)).toBe(false);
  });

  it('never marks an empty answer correct', () => {
    expect(matchesAcceptedAnswer('', sit)).toBe(false);
    expect(matchesAcceptedAnswer('   ', sit)).toBe(false);
  });

  it('never marks anything correct when no answers are configured', () => {
    // Otherwise a half-configured question would award a free point.
    expect(matchesAcceptedAnswer('anything', [])).toBe(false);
    expect(matchesAcceptedAnswer('anything', ['', '   '])).toBe(false);
  });

  it('does not match on a substring', () => {
    expect(matchesAcceptedAnswer('I like bananas and apples', ['I like bananas.'])).toBe(false);
    expect(matchesAcceptedAnswer('car', ['racing car'])).toBe(false);
  });
});
