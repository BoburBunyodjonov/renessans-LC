import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { ResourceList } from '@/components/admin/resource-list';
import { ReorderPanel } from '@/components/admin/reorder-panel';
import { listRecords, resourceConfig } from '@/server/admin/list';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return { title: resourceConfig(resource)?.title ?? 'Admin' };
}

export default async function ResourceListPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { resource } = await params;
  const config = resourceConfig(resource);
  if (!config) notFound();

  const query = await searchParams;
  const user = await currentUser();
  const canEdit = can(user?.role, 'contentCrud');

  const { rows, total, page, pageSize, sort } = await listRecords(config, {
    page: Number(query.page ?? 1) || 1,
    q: query.q,
    sort: query.sort,
    dir: query.dir === 'desc' ? 'desc' : query.dir === 'asc' ? 'asc' : undefined,
    pageSize: config.ordered ? 100 : 20,
  });

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          canEdit ? (
            <Button asChild size="sm">
              <Link href={`/admin/${config.key}/new`}>
                <Plus aria-hidden />
                {config.singular}
              </Link>
            </Button>
          ) : null
        }
      />

      {config.ordered && canEdit ? (
        <ReorderPanel config={config} rows={rows} />
      ) : (
        <ResourceList
          config={config}
          rows={rows}
          total={total}
          page={page}
          pageSize={pageSize}
          sort={sort}
          canEdit={canEdit}
        />
      )}
    </>
  );
}
