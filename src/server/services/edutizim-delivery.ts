import 'server-only';

import { prisma } from '@/lib/prisma';
import { toConfig } from '@/lib/edutizim-payload';
import { sendOrder } from '@/server/services/edutizim';

/**
 * Takes a stored attempt and files it in EduTizim as an order.
 *
 * Delivery is deliberately separate from grading. The attempt is already in our
 * database before this runs, so the worst an outage can do is leave a row
 * marked undelivered — which the admin lists and can resend. Nothing here
 * throws: a failure is recorded, never propagated into the visitor's request.
 *
 * The band the visitor landed on carries the EduTizim course and level, so a
 * moderator opens an order that already says which group the student belongs
 * in. A band with no mapping still sends the order; it just arrives unplaced.
 */
export async function deliverAttemptToEdutizim(attemptId: string): Promise<void> {
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        name: true,
        phone: true,
        score: true,
        maxScore: true,
        levelName: true,
        edutizimOrderId: true,
        bandId: true,
        categoryId: true,
      },
    });

    // Already delivered: this is the guard that makes a retry safe to press
    // twice. EduTizim also refuses a duplicate active order, but not sending is
    // better than relying on that.
    if (!attempt || attempt.edutizimOrderId) return;
    if (!attempt.name || !attempt.phone) return;

    const settings = await prisma.siteSetting.findUnique({
      where: { id: 'singleton' },
      select: { edutizim: true },
    });
    const config = toConfig(settings?.edutizim);
    if (!config.enabled) return;

    // `TestAttempt` keeps the band as a plain id rather than a relation, so the
    // mapping is read separately.
    const [category, band] = await Promise.all([
      prisma.testCategory.findUnique({
        where: { id: attempt.categoryId },
        select: { slug: true, resultMode: true },
      }),
      attempt.bandId
        ? prisma.testLevelBand.findUnique({
            where: { id: attempt.bandId },
            select: { levelName: true, edutizimCourseId: true, edutizimSubCourseId: true },
          })
        : null,
    ]);

    const isProfile = category?.resultMode === 'PROFILE';
    const kind = category?.slug ?? 'test';
    const score = isProfile ? (attempt.levelName ?? '') : `${attempt.score}/${attempt.maxScore}`;
    const level = band?.levelName ?? attempt.levelName ?? '';

    const result = await sendOrder(config, {
      name: attempt.name,
      phone: attempt.phone,
      courseId: band?.edutizimCourseId ?? null,
      subCourseId: band?.edutizimSubCourseId ?? null,
      // The comment is what a moderator reads first, so it says the three
      // things they need before ringing: which paper, what came out, and that
      // it came from the site rather than a walk-in.
      comment: buildComment({ kind, score, level, isProfile }),
      customFields: [
        [config.scoreFieldId ?? '', score],
        [config.levelFieldId ?? '', level],
        [config.kindFieldId ?? '', kind],
      ],
    });

    await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: result.ok
        ? {
            // An empty id means the order was created but the response did not
            // name it; the timestamp still marks this attempt as delivered.
            edutizimOrderId: result.orderId || 'sent',
            edutizimSentAt: new Date(),
            edutizimError: null,
          }
        : { edutizimError: result.error, edutizimSentAt: null },
    });
  } catch (error) {
    // Delivery is best-effort by design; the attempt is stored either way.
    const message = error instanceof Error ? error.message : String(error);
    await prisma.testAttempt
      .update({ where: { id: attemptId }, data: { edutizimError: message.slice(0, 200) } })
      .catch(() => undefined);
  }
}

function buildComment(input: {
  kind: string;
  score: string;
  level: string;
  isProfile: boolean;
}): string {
  const lines = [`Sayt testi: ${input.kind}`];
  if (input.score) lines.push(input.isProfile ? `Natija: ${input.score}` : `Ball: ${input.score}`);
  if (input.level && input.level !== input.score) lines.push(`Daraja: ${input.level}`);
  return lines.join('\n');
}
