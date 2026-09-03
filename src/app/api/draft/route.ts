import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { fail } from '@/lib/api';
import { can } from '@/lib/permissions';
import { currentUser } from '@/server/actions/helpers';
import { DEFAULT_LOCALE } from '@/types/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Enables Draft Mode for signed-in staff and forwards to the page being
 * previewed, so unpublished content renders on the real template
 * (PROMPT.md §14). Authentication is the gate — no shared preview secret.
 *
 *   GET /api/draft?path=/uz/courses/ielts
 *   GET /api/draft?disable=1
 */
export async function GET(request: NextRequest) {
  const draft = await draftMode();
  const params = request.nextUrl.searchParams;

  if (params.get('disable')) {
    draft.disable();
    redirect(params.get('path') || `/${DEFAULT_LOCALE}`);
  }

  const user = await currentUser();
  if (!user) return fail('UNAUTHENTICATED', 'Sign in required', 401);
  if (!can(user.role, 'contentCrud')) return fail('FORBIDDEN', 'Not allowed', 403);

  // Only same-site paths: never let this bounce a session somewhere else.
  const path = params.get('path') ?? `/${DEFAULT_LOCALE}`;
  if (!path.startsWith('/') || path.startsWith('//')) {
    return fail('BAD_PATH', 'Path must be site-relative', 400);
  }

  draft.enable();
  redirect(path);
}
