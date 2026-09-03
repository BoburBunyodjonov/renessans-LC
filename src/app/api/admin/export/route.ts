import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail } from '@/lib/api';
import { csvResponse, toCsv } from '@/lib/csv';
import { currentUser, writeAudit } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import { leadsForExport } from '@/server/admin/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** CSV export for leads, applications and test attempts (PROMPT.md §14). */
export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) return fail('UNAUTHENTICATED', 'Sign in required', 401);
  if (!can(user.role, 'exportCsv')) return fail('FORBIDDEN', 'Not allowed', 403);

  const params = request.nextUrl.searchParams;
  const entity = params.get('entity') ?? 'leads';
  const stamp = new Date().toISOString().slice(0, 10);

  if (entity === 'leads') {
    const rows = await leadsForExport({
      q: params.get('q') ?? undefined,
      status: params.get('status') ?? undefined,
      source: params.get('source') ?? undefined,
      courseId: params.get('courseId') ?? undefined,
      assigneeId: params.get('assigneeId') ?? undefined,
      from: params.get('from') ?? undefined,
      to: params.get('to') ?? undefined,
    });
    await writeAudit({
      userId: user.id,
      action: 'EXPORT',
      entity: 'Lead',
      diff: { count: rows.length },
    });
    return csvResponse(`leads-${stamp}.csv`, toCsv(rows));
  }

  if (entity === 'applications') {
    const rows = await prisma.jobApplication.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: { vacancy: { select: { slug: true } } },
    });
    await writeAudit({
      userId: user.id,
      action: 'EXPORT',
      entity: 'JobApplication',
      diff: { count: rows.length },
    });
    return csvResponse(
      `applications-${stamp}.csv`,
      toCsv(
        rows.map((row) => ({
          id: row.id,
          createdAt: row.createdAt.toISOString(),
          fullName: row.fullName,
          phone: row.phone,
          email: row.email ?? '',
          vacancy: row.vacancy?.slug ?? '',
          status: row.status,
          cvUrl: row.cvUrl ?? '',
          about: row.about ?? '',
        })),
      ),
    );
  }

  if (entity === 'attempts') {
    const rows = await prisma.testAttempt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: { category: { select: { slug: true } } },
    });
    await writeAudit({
      userId: user.id,
      action: 'EXPORT',
      entity: 'TestAttempt',
      diff: { count: rows.length },
    });
    return csvResponse(
      `test-attempts-${stamp}.csv`,
      toCsv(
        rows.map((row) => ({
          id: row.id,
          createdAt: row.createdAt.toISOString(),
          category: row.category.slug,
          name: row.name ?? '',
          phone: row.phone ?? '',
          score: row.score,
          maxScore: row.maxScore,
          level: row.levelName ?? '',
          durationSec: row.durationSec ?? '',
          locale: row.locale,
        })),
      ),
    );
  }

  return fail('UNKNOWN_ENTITY', 'Unsupported export', 400);
}
