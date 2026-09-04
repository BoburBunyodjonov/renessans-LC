'use client';

import { useMemo, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, Minus, Pencil, Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { EmptyState, StatusPill } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { describeError } from '@/components/admin/form-shell';
import { togglePublished } from '@/server/actions/content';
import { resourceLabels } from '@/components/admin/resource-labels';
import type { ColumnSpec, ResourceConfig } from '@/config/admin-resources';

type Row = Record<string, unknown>;

function localizedText(value: unknown): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uz = (value as Record<string, unknown>).uz;
    if (typeof uz === 'string') return uz;
  }
  return '';
}

function renderCell(
  spec: ColumnSpec,
  row: Row,
  labels: { yes: string; no: string },
  onToggle?: (value: boolean) => void,
) {
  const value = row[spec.name];

  switch (spec.kind) {
    case 'localized':
      return <span className="line-clamp-2 font-medium">{localizedText(value) || '—'}</span>;
    case 'boolean':
      return (
        <button
          type="button"
          onClick={() => onToggle?.(!value)}
          disabled={!onToggle}
          className="inline-flex"
          aria-pressed={Boolean(value)}
        >
          <StatusPill tone={value ? 'success' : 'neutral'}>
            {value ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Minus className="size-3.5" aria-hidden />
            )}
            {value ? labels.yes : labels.no}
          </StatusPill>
        </button>
      );
    case 'number':
      return <span className="tabular-nums">{String(value ?? 0)}</span>;
    case 'date':
      return (
        <span className="tabular-nums">
          {value ? new Date(String(value)).toLocaleDateString('uz-UZ') : '—'}
        </span>
      );
    case 'badge':
      return value ? <StatusPill tone="brand">{String(value)}</StatusPill> : <span>—</span>;
    case 'image':
      return value ? (
        <span className="relative block size-10 overflow-hidden rounded-md bg-admin-hover">
          <Image src={String(value)} alt="" fill sizes="40px" className="object-cover" />
        </span>
      ) : (
        <span className="text-admin-muted">—</span>
      );
    default:
      return <span className="line-clamp-1">{value ? String(value) : '—'}</span>;
  }
}

/** Generic list view for a registered resource. */
export function ResourceList({
  config,
  rows,
  total,
  page,
  pageSize,
  sort,
  canEdit,
}: {
  config: ResourceConfig;
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
  sort: { id: string; desc: boolean };
  canEdit: boolean;
}) {
  const router = useRouter();
  const t = useTranslations('admin');
  const labels = resourceLabels(config, t);
  const [pending, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<Row, unknown>[]>(() => {
    const base: ColumnDef<Row, unknown>[] = config.columns.map((spec) => ({
      id: spec.name,
      accessorKey: spec.name,
      header: labels.column(spec),
      cell: ({ row }) =>
        renderCell(
          spec,
          row.original,
          { yes: t('common.yes'), no: t('common.no') },
          spec.kind === 'boolean' && canEdit && spec.name === config.publishField
            ? (value) =>
                startTransition(async () => {
                  const result = await togglePublished(config.key, String(row.original.id), value);
                  if (result.ok) {
                    toast.success(value ? t('common.publishedToast') : t('common.hiddenToast'));
                    router.refresh();
                  } else {
                    toast.error(describeError(result.error, t));
                  }
                })
            : undefined,
        ),
    }));

    base.push({
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/admin/${config.key}/${String(row.original.id)}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <Pencil className="size-4" aria-hidden />
          {t('common.edit')}
        </Link>
      ),
    });

    return base;
  }, [canEdit, config, labels, router, startTransition, t]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      loading={pending}
      getRowId={(row) => String(row.id)}
      emptyState={
        <EmptyState
          title={t('common.noRecords')}
          description={t('common.addFirst')}
          action={
            canEdit ? (
              <Button asChild size="sm">
                <Link href={`/admin/${config.key}/new`}>
                  <Plus aria-hidden />
                  {t('common.add')}
                </Link>
              </Button>
            ) : null
          }
        />
      }
    />
  );
}
