import { unstable_cache } from 'next/cache';

/**
 * Cache tags shared by the read queries in `src/server/queries` and the admin
 * mutations that invalidate them (`revalidateTag`).
 */
export const TAGS = {
  settings: 'settings',
  nav: 'nav',
  home: 'home',
  courses: 'courses',
  teachers: 'teachers',
  testimonials: 'testimonials',
  faq: 'faq',
  materials: 'materials',
  vacancies: 'vacancies',
  posts: 'posts',
  promotions: 'promotions',
  tests: 'tests',
  branches: 'branches',
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

/** Homepage ISR window (PROMPT.md §6). */
export const REVALIDATE_SECONDS = 300;

/**
 * Wraps a read query in `unstable_cache`. Cached values must be JSON-safe, so
 * queries convert `Decimal` to `number` and `Date` to an ISO string before
 * returning.
 *
 * `fallback` keeps the public site (and `next build`, which prerenders from the
 * database) working when Postgres is unreachable: the affected section renders
 * empty instead of throwing, and ISR fills it in once the database is back.
 * Failures are never cached.
 */
export function cachedQuery<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  keyParts: string[],
  tags: CacheTag[],
  options: { revalidate?: number | false; fallback?: Result } = {},
) {
  const { revalidate = REVALIDATE_SECONDS, fallback } = options;

  const guarded = async (...args: Args): Promise<Result> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (fallback === undefined) throw error;
      console.error(`[query:${keyParts.join('/')}] failed, serving fallback`, error);
      return fallback;
    }
  };

  return unstable_cache(guarded, keyParts, { tags, revalidate });
}
