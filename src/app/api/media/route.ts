import type { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api';
import { listMedia } from '@/server/queries/media';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Media library listing for the picker (admin only). */
export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) return fail('UNAUTHENTICATED', 'Sign in required', 401);
  if (!can(user.role, 'contentCrud')) return fail('FORBIDDEN', 'Not allowed', 403);

  const params = request.nextUrl.searchParams;
  const result = await listMedia({
    query: params.get('q') ?? '',
    folder: params.get('folder') ?? undefined,
    page: Number(params.get('page') ?? 1) || 1,
  });

  return ok(result);
}
