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
import { LEAD_LIMITS, rateLimit } from '@/lib/ratelimit';
import { leadSchema } from '@/lib/validations/lead';
import { createLead } from '@/server/services/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const id = requestId();

  if (!isSameOrigin(request)) {
    return fail('FORBIDDEN_ORIGIN', 'Origin not allowed', 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('BAD_REQUEST', 'Body must be JSON', 400);
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    // A filled honeypot is answered with a plain success so bots learn nothing.
    if (parsed.error.issues.some((issue) => issue.message === 'spam')) {
      return ok({ id: null, deduped: false });
    }
    return validationFailed(parsed.error);
  }

  const ip = getClientIp(request);
  const [byPhone, byIp] = await Promise.all([
    rateLimit('lead-phone', parsed.data.phone, LEAD_LIMITS.phone.limit, LEAD_LIMITS.phone.window),
    rateLimit('lead-ip', ip, LEAD_LIMITS.ip.limit, LEAD_LIMITS.ip.window),
  ]);
  if (!byPhone.success || !byIp.success) return rateLimited();

  try {
    const result = await createLead(parsed.data, {
      ipHash: hashIp(ip),
      userAgent: request.headers.get('user-agent')?.slice(0, 400) ?? undefined,
    });
    return ok(result, { status: 201 });
  } catch (error) {
    logError('api/leads', id, error);
    return serverError(id);
  }
}
