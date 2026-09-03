import { PageHeader } from '@/components/admin/ui';
import { MediaLibrary } from '@/components/admin/media-library';
import { listMedia } from '@/server/queries/media';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Media' };

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await currentUser();
  if (!can(user?.role, 'contentCrud')) redirect('/admin');

  const query = await searchParams;
  const { rows, total, folders } = await listMedia({
    query: query.q,
    folder: query.folder,
    page: Number(query.page ?? 1) || 1,
    pageSize: 48,
  });

  return (
    <>
      <PageHeader title="Media kutubxonasi" description={`${total} ta fayl`} />
      <MediaLibrary rows={rows} folders={folders} activeFolder={query.folder ?? ''} />
    </>
  );
}
