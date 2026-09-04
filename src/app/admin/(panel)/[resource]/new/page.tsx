import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/ui';
import { resourceLabels } from '@/components/admin/resource-labels';
import { ResourceForm } from '@/components/admin/resource-form';
import { relationOptions, resourceConfig } from '@/server/admin/list';
import { emptyValues } from '@/server/admin/records';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import type { RelationSource } from '@/config/admin-resources';

export const dynamic = 'force-dynamic';

export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const config = resourceConfig(resource);
  if (!config) notFound();

  const t = await getTranslations('admin');
  const labels = resourceLabels(config, t as never);
  const user = await currentUser();
  if (!can(user?.role, 'contentCrud')) redirect(`/admin/${resource}`);

  const sources = [
    ...new Set(
      config.fields
        .filter((field) => field.kind === 'relation')
        .map((field) => (field.kind === 'relation' ? field.source : null))
        .filter(Boolean) as RelationSource[],
    ),
  ];
  const options = Object.fromEntries(
    await Promise.all(sources.map(async (source) => [source, await relationOptions(source)])),
  );

  return (
    <>
      <PageHeader
        title={`${t('common.new')}: ${labels.singular}`}
        description={labels.description}
      />
      <ResourceForm
        config={config}
        id={null}
        initial={emptyValues(config)}
        relationOptions={options}
        canDelete={false}
      />
    </>
  );
}
