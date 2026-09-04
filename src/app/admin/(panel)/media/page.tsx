import { PageHeader } from '@/components/admin/ui';
import { getTranslations } from 'next-intl/server';
import { MediaLibrary } from '@/components/admin/media-library';
import { listMedia } from '@/server/queries/media';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('nav.media') };
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await currentUser();
  if (!can(user?.role, 'contentCrud')) redirect('/admin');

  const query = await searchParams;
  const t = await getTranslations('admin');
  const { rows, total, folders } = await listMedia({
    query: query.q,
    folder: query.folder,
    page: Number(query.page ?? 1) || 1,
    pageSize: 48,
  });

  return (
    <>
      <PageHeader title={t('media.title')} description={t('media.fileCount', { count: total })} />
      <MediaLibrary rows={rows} folders={folders} activeFolder={query.folder ?? ''} />
    </>
  );
}
