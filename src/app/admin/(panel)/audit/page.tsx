import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { PageHeader, Panel, StatusPill } from '@/components/admin/ui';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('nav.audit') };
}

const ACTION_TONE: Record<string, 'brand' | 'success' | 'danger' | 'neutral'> = {
  CREATE: 'success',
  UPDATE: 'brand',
  DELETE: 'danger',
  RESTORE: 'success',
  EXPORT: 'neutral',
  LOGIN: 'neutral',
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await currentUser();
  if (!can(user?.role, 'viewAudit')) redirect('/admin');

  const query = await searchParams;
  const page = Number(query.page ?? 1) || 1;
  const pageSize = 50;

  const [t, rows, total] = await Promise.all([
    getTranslations('admin'),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <>
      <PageHeader title={t('nav.audit')} description={t('audit.description', { count: total })} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-admin-border">
              <tr className="text-xs text-admin-muted uppercase">
                <th className="px-3 py-2 text-start">{t('audit.time')}</th>
                <th className="px-3 py-2 text-start">{t('audit.user')}</th>
                <th className="px-3 py-2 text-start">{t('audit.action')}</th>
                <th className="px-3 py-2 text-start">{t('audit.entity')}</th>
                <th className="px-3 py-2 text-start">{t('audit.ip')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-admin-border last:border-0">
                  <td className="px-3 py-2 text-xs whitespace-nowrap text-admin-muted tabular-nums">
                    {new Date(row.createdAt).toLocaleString('uz-UZ')}
                  </td>
                  <td className="px-3 py-2">{row.user?.name ?? '—'}</td>
                  <td className="px-3 py-2">
                    <StatusPill tone={ACTION_TONE[row.action] ?? 'neutral'}>
                      {row.action}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-2">
                    {row.entity}
                    {row.entityId ? (
                      <span className="text-admin-muted"> · {row.entityId.slice(0, 8)}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs text-admin-muted">{row.ip ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-admin-muted">{t('audit.empty')}</p>
        ) : null}
      </Panel>
    </>
  );
}
