import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { Download } from 'lucide-react';
import { PageHeader, Panel, PanelTitle, StatCard } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { ScoreHistogram } from '@/components/admin/dashboard-charts';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('nav.attempts') };
}

/** CSV download endpoint — a real navigation, not a client-side route. */
const EXPORT_HREF = '/api/admin/export?entity=attempts';

export default async function AttemptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const page = Number(query.page ?? 1) || 1;
  const pageSize = 30;
  const where = query.category ? { category: { slug: query.category } } : {};

  const [t, rows, total, categories, scores, user] = await Promise.all([
    getTranslations('admin'),
    prisma.testAttempt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { slug: true } }, lead: { select: { id: true } } },
    }),
    prisma.testAttempt.count({ where }),
    prisma.testCategory.findMany({ select: { slug: true } }),
    prisma.testAttempt.findMany({ where, select: { score: true, maxScore: true } }),
    currentUser(),
  ]);

  const buckets = Array.from({ length: 10 }, (_, index) => ({
    label: `${index * 10}–${index * 10 + 10}%`,
    count: 0,
  }));
  for (const attempt of scores) {
    if (attempt.maxScore <= 0) continue;
    const index = Math.min(9, Math.floor((attempt.score / attempt.maxScore) * 10));
    buckets[index]!.count += 1;
  }

  const average =
    scores.length > 0
      ? Math.round(
          (scores.reduce((sum, item) => sum + (item.maxScore ? item.score / item.maxScore : 0), 0) /
            scores.length) *
            100,
        )
      : 0;

  return (
    <>
      <PageHeader
        title={t('nav.attempts')}
        description={t('attempts.description', { count: total })}
        actions={
          can(user?.role, 'exportCsv') ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
            >
              <a href={EXPORT_HREF}>
                <Download aria-hidden />
                CSV
              </a>
            </Button>
          ) : null
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <StatCard label={t('attempts.count')} value={total} />
        <StatCard label={t('attempts.average')} value={`${average}%`} />
        <StatCard label={t('attempts.tracks')} value={categories.length} />
      </div>

      <div className="mb-4">
        <ScoreHistogram data={buckets} />
      </div>

      <Panel>
        <PanelTitle>{t('attempts.recent')}</PanelTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-admin-border">
              <tr className="text-xs text-admin-muted uppercase">
                <th className="px-3 py-2 text-start">{t('leads.date')}</th>
                <th className="px-3 py-2 text-start">{t('attempts.track')}</th>
                <th className="px-3 py-2 text-start">{t('leads.name')}</th>
                <th className="px-3 py-2 text-start">{t('leads.phone')}</th>
                <th className="px-3 py-2 text-start">{t('attempts.score')}</th>
                <th className="px-3 py-2 text-start">{t('attempts.level')}</th>
                <th className="px-3 py-2 text-start">{t('attempts.lead')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((attempt) => (
                <tr key={attempt.id} className="border-b border-admin-border last:border-0">
                  <td className="px-3 py-2 text-xs text-admin-muted tabular-nums">
                    {new Date(attempt.createdAt).toLocaleString('uz-UZ')}
                  </td>
                  <td className="px-3 py-2">{attempt.category.slug}</td>
                  <td className="px-3 py-2">{attempt.name ?? '—'}</td>
                  <td className="px-3 py-2 tabular-nums">{attempt.phone ?? '—'}</td>
                  <td className="px-3 py-2 font-semibold tabular-nums">
                    {attempt.score}/{attempt.maxScore}
                  </td>
                  <td className="px-3 py-2">{attempt.levelName ?? '—'}</td>
                  <td className="px-3 py-2">
                    {attempt.lead ? (
                      <a
                        href={`/admin/leads/${attempt.lead.id}`}
                        className="font-semibold text-brand-600"
                      >
                        {t('attempts.open')}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-admin-muted">{t('attempts.empty')}</p>
        ) : null}
      </Panel>
    </>
  );
}
