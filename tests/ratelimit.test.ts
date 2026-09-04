import { describe, expect, it } from 'vitest';
import { peekRateLimit, rateLimit } from '@/lib/ratelimit';

/**
 * Sign-in protection counts *failed* attempts only (PROMPT.md §14). Peeking must
 * therefore never consume a slot, or a staff member who keeps typing the right
 * password would lock themselves out.
 */
describe('peekRateLimit', () => {
  it('does not consume the budget', async () => {
    const id = `peek-${Math.random()}`;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const peeked = await peekRateLimit('test-peek', id, 5, '15 m');
      expect(peeked.success).toBe(true);
      expect(peeked.remaining).toBe(5);
    }
  });

  it('reports the budget consumed by real attempts and blocks past the limit', async () => {
    const id = `mixed-${Math.random()}`;

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      expect((await peekRateLimit('test-mixed', id, 5, '15 m')).success).toBe(true);
      expect((await rateLimit('test-mixed', id, 5, '15 m')).success).toBe(true);
    }

    const exhausted = await peekRateLimit('test-mixed', id, 5, '15 m');
    expect(exhausted.success).toBe(false);
    expect(exhausted.remaining).toBe(0);
    expect((await rateLimit('test-mixed', id, 5, '15 m')).success).toBe(false);
  });

  it('tracks identifiers independently', async () => {
    const suffix = Math.random();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await rateLimit('test-scope', `first-${suffix}`, 5, '15 m');
    }

    expect((await peekRateLimit('test-scope', `first-${suffix}`, 5, '15 m')).success).toBe(false);
    expect((await peekRateLimit('test-scope', `second-${suffix}`, 5, '15 m')).success).toBe(true);
  });
});
