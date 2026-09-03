import type { NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { fail, ok, validationFailed } from '@/lib/api';
import { TAGS } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  tags: z.array(z.string()).max(20).optional(),
  paths: z.array(z.string().startsWith('/')).max(20).optional(),
});

const KNOWN_TAGS = new Set<string>(Object.values(TAGS));

/**
 * Secret-guarded cache invalidation for deploy hooks and external tooling
 * (PROMPT.md §15). The admin invalidates through server actions instead.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return fail('NOT_CONFIGURED', 'REVALIDATE_SECRET is not set', 503);

  const provided =
    request.headers.get('x-revalidate-secret') ?? request.nextUrl.searchParams.get('secret');
  if (provided !== secret) return fail('FORBIDDEN', 'Invalid secret', 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationFailed(parsed.error);

  const tags = (parsed.data.tags ?? []).filter((tag) => KNOWN_TAGS.has(tag));
  const unknown = (parsed.data.tags ?? []).filter((tag) => !KNOWN_TAGS.has(tag));
  const paths = parsed.data.paths ?? [];

  // Nothing specified means "everything the public site caches".
  const effectiveTags = tags.length === 0 && paths.length === 0 ? [...KNOWN_TAGS] : tags;

  for (const tag of effectiveTags) revalidateTag(tag);
  for (const path of paths) revalidatePath(path);

  return ok({ revalidated: { tags: effectiveTags, paths }, ignoredTags: unknown });
}
