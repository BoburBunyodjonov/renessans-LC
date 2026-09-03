import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
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
import { notify, telegramLines } from '@/lib/telegram';
import { absoluteUrl } from '@/lib/utils';
import { contactSchema } from '@/lib/validations/lead';

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

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.message === 'spam')) {
      return ok({ id: null });
    }
    return validationFailed(parsed.error);
  }

  const ip = getClientIp(request);
  const limited = await rateLimit('contact-ip', ip, 10, '1 h');
  if (!limited.success) return rateLimited();

  try {
    const message = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email ?? null,
        subject: parsed.data.subject ?? null,
        message: parsed.data.message,
        locale: parsed.data.locale,
        ipHash: hashIp(ip),
      },
      select: { id: true },
    });

    notify(
      `✉️ <b>Yangi xabar</b>\n\n${telegramLines([
        ['Ism', parsed.data.name],
        ['Telefon', parsed.data.phone],
        ['Email', parsed.data.email],
        ['Mavzu', parsed.data.subject],
        ['Xabar', parsed.data.message],
      ])}\n\n${absoluteUrl('/admin/messages')}`,
      { kind: 'contact' },
    );

    return ok({ id: message.id }, { status: 201 });
  } catch (error) {
    logError('api/contact', id, error);
    return serverError(id);
  }
}
