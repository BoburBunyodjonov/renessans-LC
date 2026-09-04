import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Upstash in production, an in-memory sliding window locally. The fallback is
 * per-process only — good enough for dev, never relied on in production.
 */

type Result = { success: boolean; remaining: number; reset: number };

const memoryHits = new Map<string, number[]>();

/** Reads the current window without consuming a slot. */
function memoryPeek(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  const hits = (memoryHits.get(key) ?? []).filter((time) => now - time < windowMs);
  return {
    success: hits.length < limit,
    remaining: Math.max(0, limit - hits.length),
    reset: now + windowMs,
  };
}

function memoryLimit(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  const hits = (memoryHits.get(key) ?? []).filter((time) => now - time < windowMs);
  const success = hits.length < limit;
  if (success) hits.push(now);
  memoryHits.set(key, hits);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (memoryHits.size > 5000) {
    for (const [existingKey, times] of memoryHits) {
      if (times.every((time) => now - time >= windowMs)) memoryHits.delete(existingKey);
    }
  }

  return {
    success,
    remaining: Math.max(0, limit - hits.length),
    reset: now + windowMs,
  };
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const limiters = new Map<string, Ratelimit>();

function upstashLimiter(name: string, limit: number, window: `${number} ${'s' | 'm' | 'h'}`) {
  if (!redis) return null;
  const key = `${name}:${limit}:${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `rl:${name}`,
      analytics: false,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

const WINDOW_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
};

export async function rateLimit(
  name: string,
  identifier: string,
  limit: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
): Promise<Result> {
  const limiter = upstashLimiter(name, limit, window);
  if (limiter) {
    const result = await limiter.limit(identifier);
    return { success: result.success, remaining: result.remaining, reset: result.reset };
  }

  const [amount, unit] = window.split(' ') as [string, 's' | 'm' | 'h'];
  return memoryLimit(`${name}:${identifier}`, limit, Number(amount) * WINDOW_MS[unit]!);
}

/**
 * Checks a limit **without** consuming a slot. Used where only failures should
 * count against the budget — sign-in, for example, where locking out someone who
 * keeps typing the right password would be a bug, not protection.
 */
export async function peekRateLimit(
  name: string,
  identifier: string,
  limit: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
): Promise<Result> {
  const limiter = upstashLimiter(name, limit, window);
  if (limiter) {
    const remaining = await limiter.getRemaining(identifier);
    const left = typeof remaining === 'number' ? remaining : remaining.remaining;
    return { success: left > 0, remaining: left, reset: Date.now() };
  }

  const [amount, unit] = window.split(' ') as [string, 's' | 'm' | 'h'];
  return memoryPeek(`${name}:${identifier}`, limit, Number(amount) * WINDOW_MS[unit]!);
}

/** Limits from PROMPT.md §11: 5 per phone per hour, 20 per IP per hour. */
export const LEAD_LIMITS = {
  phone: { limit: 5, window: '1 h' as const },
  ip: { limit: 20, window: '1 h' as const },
};
