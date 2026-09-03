import { prisma } from '@/lib/prisma';
import { notify, telegramLines } from '@/lib/telegram';
import { absoluteUrl } from '@/lib/utils';
import type { LeadPayload } from '@/lib/validations/lead';

export type LeadMeta = {
  ipHash?: string;
  userAgent?: string;
};

export type LeadResult = {
  id: string;
  deduped: boolean;
};

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Creates a lead, or — when the same phone already wrote in during the last 24h —
 * updates that lead and appends a note instead of creating a duplicate
 * (PROMPT.md §11). The Telegram notification is fire-and-forget.
 */
export async function createLead(payload: LeadPayload, meta: LeadMeta = {}): Promise<LeadResult> {
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);

  const existing = await prisma.lead.findFirst({
    where: { phone: payload.phone, deletedAt: null, createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true },
  });

  const course = payload.courseId
    ? await prisma.course.findUnique({
        where: { id: payload.courseId },
        select: { id: true, title: true },
      })
    : null;

  const shared = {
    name: payload.name,
    email: payload.email ?? null,
    courseId: course?.id ?? null,
    message: payload.message ?? null,
    preferredTime: payload.preferredTime ?? null,
    source: payload.source,
    page: payload.page ?? null,
    locale: payload.locale,
    utmSource: payload.utmSource ?? null,
    utmMedium: payload.utmMedium ?? null,
    utmCampaign: payload.utmCampaign ?? null,
    utmContent: payload.utmContent ?? null,
    utmTerm: payload.utmTerm ?? null,
    referrer: payload.referrer ?? null,
    userAgent: meta.userAgent ?? null,
    ipHash: meta.ipHash ?? null,
  };

  let leadId: string;

  if (existing) {
    const updated = await prisma.lead.update({
      where: { id: existing.id },
      data: {
        ...shared,
        notes: {
          create: {
            body: `Repeat request from the same phone (source: ${payload.source}${
              payload.page ? `, page: ${payload.page}` : ''
            }).`,
          },
        },
      },
      select: { id: true },
    });
    leadId = updated.id;
  } else {
    const created = await prisma.lead.create({
      data: { phone: payload.phone, ...shared },
      select: { id: true },
    });
    leadId = created.id;
  }

  notifyNewLead({
    id: leadId,
    name: payload.name,
    phone: payload.phone,
    courseTitle: courseTitleOf(course?.title),
    source: payload.source,
    page: payload.page,
    locale: payload.locale,
    message: payload.message,
    preferredTime: payload.preferredTime,
    repeat: Boolean(existing),
  });

  return { id: leadId, deduped: Boolean(existing) };
}

function courseTitleOf(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const uz = record.uz;
  return typeof uz === 'string' && uz.trim() ? uz : undefined;
}

function notifyNewLead(lead: {
  id: string;
  name: string;
  phone: string;
  courseTitle?: string;
  source: string;
  page?: string;
  locale: string;
  message?: string;
  preferredTime?: string;
  repeat: boolean;
}) {
  const title = lead.repeat ? '♻️ <b>Takroriy ariza</b>' : '🔥 <b>Yangi ariza</b>';
  const body = telegramLines([
    ['Ism', lead.name],
    ['Telefon', lead.phone],
    ['Kurs', lead.courseTitle],
    ['Manba', lead.source],
    ['Sahifa', lead.page],
    ['Til', lead.locale],
    ['Qulay vaqt', lead.preferredTime],
    ['Xabar', lead.message],
  ]);

  notify(`${title}\n\n${body}\n\n${absoluteUrl(`/admin/leads/${lead.id}`)}`, { kind: 'lead' });
}
