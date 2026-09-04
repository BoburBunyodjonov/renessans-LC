'use client';

import { useMemo, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, Phone, Send } from 'lucide-react';
import { DataTable, selectionColumn } from '@/components/admin/data-table';
import { EmptyState, StatusPill } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { describeError } from '@/components/admin/form-shell';
import { bulkUpdateLeads, updateLeadStatus } from '@/server/actions/leads';
import {
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_TONE,
} from '@/config/lead-status';
import type { LeadRow } from '@/server/admin/leads';

type Option = { value: string; label: string };

export function LeadsTable({
  rows,
  total,
  page,
  pageSize,
  sort,
  courses,
  staff,
  canManage,
  canExport,
}: {
  rows: LeadRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: { id: string; desc: boolean };
  courses: Option[];
  staff: Option[];
  canManage: boolean;
  canExport: boolean;
}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const columns = useMemo<ColumnDef<LeadRow, unknown>[]>(() => {
    const list: ColumnDef<LeadRow, unknown>[] = [];
    if (canManage) {
      list.push(
        selectionColumn<LeadRow>({
          selectAll: t('common.selectAll'),
          selectRow: t('common.selectRow'),
        }),
      );
    }

    list.push(
      {
        id: 'name',
        accessorKey: 'name',
        header: t('leads.name'),
        cell: ({ row }) => (
          <Link
            href={`/admin/leads/${row.original.id}`}
            className="font-semibold text-admin-text hover:text-brand-600"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        id: 'phone',
        accessorKey: 'phone',
        header: t('leads.phone'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <a href={`tel:${row.original.phone}`} className="text-admin-text tabular-nums">
              {row.original.phone}
            </a>
            <a
              href={`tel:${row.original.phone}`}
              title={t('dash.call')}
              className="text-brand-600 hover:text-brand-700 dark:text-admin-accent dark:hover:text-admin-accent"
            >
              <Phone className="size-4" aria-hidden />
            </a>
            <a
              href={`https://t.me/+${row.original.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram"
              className="text-brand-600 hover:text-brand-700 dark:text-admin-accent dark:hover:text-admin-accent"
            >
              <Send className="size-4" aria-hidden />
            </a>
          </div>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: t('leads.status'),
        cell: ({ row }) =>
          canManage ? (
            <select
              value={row.original.status}
              onChange={(event) =>
                startTransition(async () => {
                  const result = await updateLeadStatus(row.original.id, event.target.value);
                  if (result.ok) {
                    toast.success(t('common.statusUpdated'));
                    router.refresh();
                  } else {
                    toast.error(describeError(result.error, t));
                  }
                })
              }
              className="rounded-md border border-admin-border bg-admin-panel px-2 py-1 text-xs font-semibold text-admin-text"
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LEAD_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          ) : (
            <StatusPill tone={LEAD_STATUS_TONE[row.original.status] ?? 'neutral'}>
              {LEAD_STATUS_LABELS[row.original.status as keyof typeof LEAD_STATUS_LABELS]}
            </StatusPill>
          ),
      },
      {
        id: 'source',
        accessorKey: 'source',
        header: t('leads.source'),
        cell: ({ row }) => (
          <span className="text-xs text-admin-muted">
            {LEAD_SOURCE_LABELS[row.original.source] ?? row.original.source}
          </span>
        ),
      },
      {
        id: 'course',
        accessorKey: 'course',
        header: t('leads.course'),
        cell: ({ row }) => <span className="text-sm">{row.original.course ?? '—'}</span>,
      },
      {
        id: 'assignee',
        accessorKey: 'assignee',
        header: t('leads.assignee'),
        cell: ({ row }) => <span className="text-sm">{row.original.assignee ?? '—'}</span>,
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: t('leads.date'),
        cell: ({ row }) => (
          <span className="text-xs text-admin-muted tabular-nums">
            {new Date(row.original.createdAt).toLocaleString('uz-UZ', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
        ),
      },
    );

    return list;
  }, [canManage, router, t]);

  const exportHref = `/api/admin/export?entity=leads&${searchParams.toString()}`;

  return (
    <DataTable
      columns={columns}
      data={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      sort={sort}
      loading={pending}
      getRowId={(row) => row.id}
      searchPlaceholder={t('leads.searchPlaceholder')}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label={t('leads.status')}
            allLabel={t('leads.filterAll', { label: t('leads.status') })}
            value={searchParams.get('status') ?? ''}
            options={LEAD_STATUSES.map((status) => ({
              value: status,
              label: LEAD_STATUS_LABELS[status],
            }))}
            onChange={(value) => setParam('status', value)}
          />
          <FilterSelect
            label={t('leads.source')}
            allLabel={t('leads.filterAll', { label: t('leads.source') })}
            value={searchParams.get('source') ?? ''}
            options={Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => ({ value, label }))}
            onChange={(value) => setParam('source', value)}
          />
          <FilterSelect
            label={t('leads.course')}
            allLabel={t('leads.filterAll', { label: t('leads.course') })}
            value={searchParams.get('courseId') ?? ''}
            options={courses}
            onChange={(value) => setParam('courseId', value)}
          />
          <FilterSelect
            label={t('leads.assignee')}
            allLabel={t('leads.filterAll', { label: t('leads.assignee') })}
            value={searchParams.get('assigneeId') ?? ''}
            options={staff}
            onChange={(value) => setParam('assigneeId', value)}
          />
          <input
            type="date"
            aria-label={t('leads.from')}
            value={searchParams.get('from') ?? ''}
            onChange={(event) => setParam('from', event.target.value)}
            className="h-10 rounded-md border border-admin-border bg-admin-panel px-2 text-xs text-admin-text"
          />
          <input
            type="date"
            aria-label={t('leads.to')}
            value={searchParams.get('to') ?? ''}
            onChange={(event) => setParam('to', event.target.value)}
            className="h-10 rounded-md border border-admin-border bg-admin-panel px-2 text-xs text-admin-text"
          />
          {canExport ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
            >
              <a href={exportHref}>
                <Download aria-hidden />
                CSV
              </a>
            </Button>
          ) : null}
        </div>
      }
      bulkActions={
        canManage
          ? (ids, clear) => (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(event) => {
                    const status = event.target.value;
                    if (!status) return;
                    startTransition(async () => {
                      const result = await bulkUpdateLeads(ids, { status });
                      if (result.ok) {
                        toast.success(t('common.statusUpdated'));
                        clear();
                        router.refresh();
                      } else {
                        toast.error(describeError(result.error, t));
                      }
                    });
                  }}
                  className="rounded-md border border-brand-600/40 bg-admin-panel px-2 py-1.5 text-xs font-semibold text-admin-text"
                >
                  <option value="">{t('leads.bulkStatus')}</option>
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {LEAD_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>

                <select
                  defaultValue=""
                  onChange={(event) => {
                    const assigneeId = event.target.value;
                    if (!assigneeId) return;
                    startTransition(async () => {
                      const result = await bulkUpdateLeads(ids, { assigneeId });
                      if (result.ok) {
                        toast.success(t('leads.assigned'));
                        clear();
                        router.refresh();
                      } else {
                        toast.error(describeError(result.error, t));
                      }
                    });
                  }}
                  className="rounded-md border border-brand-600/40 bg-admin-panel px-2 py-1.5 text-xs font-semibold text-admin-text"
                >
                  <option value="">{t('leads.bulkAssign')}</option>
                  {staff.map((member) => (
                    <option key={member.value} value={member.value}>
                      {member.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          : undefined
      }
      emptyState={<EmptyState title={t('leads.empty')} description={t('leads.emptyHint')} />}
    />
  );
}

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-admin-border bg-admin-panel px-2 text-xs font-semibold text-admin-text"
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
