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
import { putObject } from '@/lib/storage';
import { validateUpload } from '@/lib/upload';
import { notify, telegramLines } from '@/lib/telegram';
import { absoluteUrl } from '@/lib/utils';
import { applicationSchema } from '@/lib/validations/application';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const id = requestId();

  if (!isSameOrigin(request)) {
    return fail('FORBIDDEN_ORIGIN', 'Origin not allowed', 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('BAD_REQUEST', 'Body must be multipart/form-data', 400);
  }

  const parsed = applicationSchema.safeParse({
    vacancyId: form.get('vacancyId')?.toString() ?? '',
    fullName: form.get('fullName')?.toString() ?? '',
    phone: form.get('phone')?.toString() ?? '',
    email: form.get('email')?.toString() ?? '',
    birthDate: form.get('birthDate')?.toString() ?? '',
    about: form.get('about')?.toString() ?? '',
    consent: form.get('consent')?.toString() ?? '',
    locale: form.get('locale')?.toString() || 'uz',
    hp: form.get('hp')?.toString() ?? '',
  });

  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.message === 'spam')) {
      return ok({ id: null });
    }
    return validationFailed(parsed.error);
  }

  const ip = getClientIp(request);
  const limited = await rateLimit('application-ip', ip, 5, '1 h');
  if (!limited.success) return rateLimited();

  // ---- CV upload -------------------------------------------------------
  let cvUrl: string | null = null;
  let cvName: string | null = null;

  const cv = form.get('cv');
  if (cv instanceof File && cv.size > 0) {
    const buffer = Buffer.from(await cv.arrayBuffer());
    const check = validateUpload(buffer, cv.name, cv.type, 'document');
    if (!check.ok) {
      return fail('INVALID_FILE', 'CV rejected', 422, { cv: check.reason });
    }

    try {
      const stored = await putObject({
        body: buffer,
        mimeType: check.mimeType,
        filename: cv.name,
        folder: 'cv',
      });
      cvUrl = stored.url;
      cvName = cv.name.slice(0, 120);
    } catch (error) {
      logError('api/applications:upload', id, error);
      return serverError(id);
    }
  }

  try {
    const vacancy = parsed.data.vacancyId
      ? await prisma.vacancy.findUnique({
          where: { id: parsed.data.vacancyId },
          select: { id: true, title: true },
        })
      : null;

    const application = await prisma.jobApplication.create({
      data: {
        vacancyId: vacancy?.id ?? null,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email ?? null,
        birthDate: parsed.data.birthDate ?? null,
        about: parsed.data.about ?? null,
        cvUrl,
        cvName,
        locale: parsed.data.locale,
        ipHash: hashIp(ip),
      },
      select: { id: true },
    });

    notify(
      `💼 <b>Yangi ariza (vakansiya)</b>\n\n${telegramLines([
        ['Ism', parsed.data.fullName],
        ['Telefon', parsed.data.phone],
        ['Email', parsed.data.email],
        ['Vakansiya', vacancyTitle(vacancy?.title)],
        ['Rezyume', cvUrl ? 'bor' : 'yo‘q'],
        ['Izoh', parsed.data.about],
      ])}\n\n${absoluteUrl('/admin/applications')}`,
      { kind: 'application' },
    );

    return ok({ id: application.id }, { status: 201 });
  } catch (error) {
    logError('api/applications', id, error);
    return serverError(id);
  }
}

function vacancyTitle(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const uz = (value as Record<string, unknown>).uz;
  return typeof uz === 'string' && uz.trim() ? uz : undefined;
}
