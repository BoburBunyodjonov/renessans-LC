/**
 * Compares a typed test answer against the answers a teacher marked correct.
 *
 * The Kids paper is written by hand and marked by a person, who silently
 * forgives a missing full stop, a capital letter, or `o'tirmoq` typed with
 * whichever apostrophe the keyboard offered. Grading it online has to forgive
 * the same things or it fails children for punctuation.
 *
 * What it does *not* forgive is a different word: matching stays exact after
 * normalisation rather than fuzzy, so `swim` never passes for `swimming`
 * unless a teacher listed both.
 */

/**
 * Uzbek Latin is written with any of these in place of the modifier letter in
 * `oʻ` and `gʻ`, depending on the keyboard: a typographic apostrophe, a
 * straight quote, a backtick, an acute accent. They all mean the same letter.
 */
const APOSTROPHES = /[‘’ʻʼ`´'`]/g;

/** Punctuation that a marker would ignore at the end of an answer. */
const TRAILING_PUNCTUATION = /[.!?,;:]+$/;

export function normalizeAnswer(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      // Strip diacritic marks so `ё` typed as `е` still matches.
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(APOSTROPHES, "'")
      // Collapse any run of whitespace, including line breaks from a textarea.
      .replace(/\s+/g, ' ')
      .replace(TRAILING_PUNCTUATION, '')
      .trim()
  );
}

/**
 * True when `given` matches any accepted answer. An empty answer is never
 * correct, which also stops a question with no accepted answers configured
 * from marking everything right.
 */
export function matchesAcceptedAnswer(given: string, accepted: readonly string[]): boolean {
  const normalized = normalizeAnswer(given);
  if (!normalized) return false;

  return accepted.some((candidate) => {
    const target = normalizeAnswer(candidate);
    return target.length > 0 && target === normalized;
  });
}
