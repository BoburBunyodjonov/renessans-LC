import type { NextRequest } from 'next/server';
import {
  fail,
  isSameOrigin,
  logError,
  ok,
  rateLimited,
  requestId,
  serverError,
  validationFailed,
} from '@/lib/api';
import { getClientIp, hashIp } from '@/lib/ip';
import { rateLimit } from '@/lib/ratelimit';
import { testSubmitSchema } from '@/lib/validations/test';
import { submitAttempt } from '@/server/services/test-attempts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const id = requestId();
  const { slug } = await params;

  if (!isSameOrigin(request)) {
    return fail('FORBIDDEN_ORIGIN', 'Origin not allowed', 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('BAD_REQUEST', 'Body must be JSON', 400);
  }

  const parsed = testSubmitSchema.safeParse(body);
  if (!parsed.success) return validationFailed(parsed.error);

  const ip = getClientIp(request);
  const limited = await rateLimit('test-submit', ip, 20, '1 h');
  if (!limited.success) return rateLimited();

  try {
    const result = await submitAttempt(slug, parsed.data, {
      ipHash: hashIp(ip),
      userAgent: request.headers.get('user-agent')?.slice(0, 400) ?? undefined,
    });

    if (!result) return fail('NOT_FOUND', 'Test not found', 404);
    if ('stale' in result) {
      return fail('STALE_TEST', 'Question bank changed, reload the test', 409);
    }
    return ok(result, { status: 201 });
  } catch (error) {
    logError('api/test/submit', id, error);
    return serverError(id);
  }
}
