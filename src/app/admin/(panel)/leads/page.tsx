import { Suspense } from 'react';
import { PageHeader, TableSkeleton } from '@/components/admin/ui';
import { LeadsTable } from '@/components/admin/leads-table';
import { leadFilterOptions, listLeads } from '@/server/admin/leads';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Arizalar' };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const [user, { courses, staff }, data] = await Promise.all([
    currentUser(),
    leadFilterOptions(),
    listLeads({
      q: query.q,
      status: query.status,
      source: query.source,
      courseId: query.courseId,
      assigneeId: query.assigneeId,
      from: query.from,
      to: query.to,
      page: Number(query.page ?? 1) || 1,
      sort: query.sort,
      dir: query.dir === 'asc' ? 'asc' : 'desc',
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Arizalar"
        description={`Jami ${data.total} ta ariza. Holat va mas’ulni shu yerdan o‘zgartiring.`}
      />
      <Suspense fallback={<TableSkeleton />}>
        <LeadsTable
          rows={data.rows}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          sort={data.sort}
          courses={courses}
          staff={staff}
          canManage={can(user?.role, 'manageLeads')}
          canExport={can(user?.role, 'exportCsv')}
        />
      </Suspense>
    </>
  );
}
