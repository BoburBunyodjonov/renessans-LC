'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { Download, FileText } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { EmptyState, StatusPill } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/field';
import { describeError } from '@/components/admin/form-shell';
import { saveApplicationNote, updateApplicationStatus } from '@/server/actions/leads';
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from '@/config/lead-status';

/** CSV download endpoint — a real navigation, not a client-side route. */
const EXPORT_HREF = '/api/admin/export?entity=applications';

export type ApplicationRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  status: string;
  vacancy: string | null;
  cvUrl: string | null;
  cvName: string | null;
  about: string | null;
  note: string | null;
  createdAt: string;
};

export function ApplicationsTable({
  rows,
  total,
  page,
  pageSize,
  vacancies,
  canManage,
  canExport,
}: {
  rows: ApplicationRow[];
  total: number;
  page: number;
  pageSize: number;
  vacancies: { value: string; label: string }[];
  canManage: boolean;
  canExport: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('admin');
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const columns = useMemo<ColumnDef<ApplicationRow, unknown>[]>(
    () => [
      {
        id: 'fullName',
        accessorKey: 'fullName',
        header: t('apps.candidate'),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => {
              setOpenId(openId === row.original.id ? null : row.original.id);
              setNote(row.original.note ?? '');
            }}
            className="text-start font-semibold text-admin-text hover:text-brand-600"
          >
            {row.original.fullName}
          </button>
        ),
      },
      {
        id: 'phone',
        accessorKey: 'phone',
        header: t('leads.phone'),
        cell: ({ row }) => (
          <a href={`tel:${row.original.phone}`} className="tabular-nums">
            {row.original.phone}
          </a>
        ),
      },
      {
        id: 'vacancy',
        accessorKey: 'vacancy',
        header: t('apps.vacancy'),
        cell: ({ row }) => <span className="text-sm">{row.original.vacancy ?? '—'}</span>,
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
                  const result = await updateApplicationStatus(row.original.id, event.target.value);
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
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {APPLICATION_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          ) : (
            <StatusPill tone={row.original.status === 'HIRED' ? 'success' : 'neutral'}>
              {row.original.status}
            </StatusPill>
          ),
      },
      {
        id: 'cvUrl',
        accessorKey: 'cvUrl',
        header: t('apps.cv'),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.cvUrl ? (
            <a
              href={row.original.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <FileText className="size-4" aria-hidden />
              {row.original.cvName ?? t('apps.download')}
            </a>
          ) : (
            <span className="text-admin-muted">—</span>
          ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: t('leads.date'),
        cell: ({ row }) => (
          <span className="text-xs text-admin-muted tabular-nums">
            {new Date(row.original.createdAt).toLocaleDateString('uz-UZ')}
          </span>
        ),
      },
    ],
    [canManage, openId, router, t],
  );

  const open = rows.find((row) => row.id === openId);

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={columns}
        data={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={pending}
        getRowId={(row) => row.id}
        searchPlaceholder={t('leads.searchPlaceholder')}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label={t('leads.status')}
              value={searchParams.get('status') ?? ''}
              onChange={(event) => setParam('status', event.target.value)}
              className="h-10 rounded-md border border-admin-border bg-admin-panel px-2 text-xs font-semibold text-admin-text"
            >
              <option value="">{t('leads.filterAll', { label: t('leads.status') })}</option>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {APPLICATION_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <select
              aria-label={t('apps.vacancy')}
              value={searchParams.get('vacancyId') ?? ''}
              onChange={(event) => setParam('vacancyId', event.target.value)}
              className="h-10 rounded-md border border-admin-border bg-admin-panel px-2 text-xs font-semibold text-admin-text"
            >
              <option value="">{t('leads.filterAll', { label: t('apps.vacancy') })}</option>
              {vacancies.map((vacancy) => (
                <option key={vacancy.value} value={vacancy.value}>
                  {vacancy.label}
                </option>
              ))}
            </select>
            {canExport ? (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
              >
                <a href={EXPORT_HREF}>
                  <Download aria-hidden />
                  CSV
                </a>
              </Button>
            ) : null}
          </div>
        }
        emptyState={<EmptyState title={t('apps.empty')} description={t('apps.emptyHint')} />}
      />

      {open ? (
        <div className="rounded-lg border border-admin-border bg-admin-panel p-5">
          <h2 className="font-display text-lg font-extrabold text-admin-text">{open.fullName}</h2>
          <p className="mt-1 text-sm text-admin-muted">
            {open.phone}
            {open.email ? ` · ${open.email}` : ''}
          </p>
          {open.about ? (
            <p className="mt-3 text-sm whitespace-pre-line text-admin-text">{open.about}</p>
          ) : null}

          {canManage ? (
            <div className="mt-4 flex flex-col gap-2">
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t('apps.notePlaceholder')}
                className="border-admin-border bg-admin-panel text-admin-text"
              />
              <Button
                size="sm"
                className="self-start"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await saveApplicationNote(open.id, note);
                    if (result.ok) {
                      toast.success(t('apps.noteSaved'));
                      router.refresh();
                    } else {
                      toast.error(describeError(result.error, t));
                    }
                  })
                }
              >
                {t('apps.saveNote')}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
