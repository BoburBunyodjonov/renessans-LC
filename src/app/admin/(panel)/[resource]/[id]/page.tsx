import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/ui';
import { resourceLabels } from '@/components/admin/resource-labels';
import { ResourceForm } from '@/components/admin/resource-form';
import { getRecord, relationOptions, resourceConfig } from '@/server/admin/list';
import { toFormValues } from '@/server/admin/records';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import { DEFAULT_LOCALE } from '@/types/i18n';
import type { RelationSource } from '@/config/admin-resources';

export const dynamic = 'force-dynamic';

/** Public preview target for resources that have a page of their own. */
function previewFor(resource: string, row: Record<string, unknown>): string | undefined {
  const slug = typeof row.slug === 'string' ? row.slug : null;
  switch (resource) {
    case 'posts':
      return slug ? `/${DEFAULT_LOCALE}/blog/${slug}` : undefined;
    case 'vacancies':
      return slug ? `/${DEFAULT_LOCALE}/join-team/${slug}` : undefined;
    case 'materials':
      return `/${DEFAULT_LOCALE}/materials`;
    case 'courses':
      return slug ? `/${DEFAULT_LOCALE}/courses/${slug}` : `/${DEFAULT_LOCALE}`;
    case 'teachers':
      return `/${DEFAULT_LOCALE}/teachers`;
    case 'home-sections':
      return `/${DEFAULT_LOCALE}`;
    case 'hero':
    case 'stats':
    case 'advantages':
    case 'testimonials':
    case 'problems':
    case 'promotions':
    case 'faq':
    case 'success-stories':
      return `/${DEFAULT_LOCALE}`;
    case 'branches':
      return `/${DEFAULT_LOCALE}/contact`;
    default:
      return undefined;
  }
}

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  const config = resourceConfig(resource);
  if (!config) notFound();

  const row = await getRecord(config, id);
  if (!row) notFound();

  const t = await getTranslations('admin');
  const labels = resourceLabels(config, t as never);
  const user = await currentUser();
  const canEdit = can(user?.role, 'contentCrud');

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
      <PageHeader title={labels.singular} description={labels.description} />
      <ResourceForm
        config={config}
        id={id}
        initial={toFormValues(config, row)}
        relationOptions={options}
        previewHref={previewFor(resource, row)}
        canDelete={canEdit && can(user?.role, 'softDelete')}
      />
    </>
  );
}
