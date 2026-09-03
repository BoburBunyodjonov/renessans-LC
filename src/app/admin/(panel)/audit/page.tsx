import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader, Panel, StatusPill } from '@/components/admin/ui';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Audit jurnali' };

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

  const [rows, total] = await Promise.all([
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
      <PageHeader title="Audit jurnali" description={`Jami ${total} ta yozuv`} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-admin-border">
              <tr className="text-xs text-admin-muted uppercase">
                <th className="px-3 py-2 text-start">Vaqt</th>
                <th className="px-3 py-2 text-start">Foydalanuvchi</th>
                <th className="px-3 py-2 text-start">Amal</th>
                <th className="px-3 py-2 text-start">Obyekt</th>
                <th className="px-3 py-2 text-start">IP</th>
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
          <p className="py-6 text-center text-sm text-admin-muted">Yozuv yo‘q</p>
        ) : null}
      </Panel>
    </>
  );
}
