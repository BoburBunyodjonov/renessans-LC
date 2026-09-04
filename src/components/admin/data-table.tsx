'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Columns3, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { TableSkeleton } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

export type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  sort?: { id: string; desc: boolean };
  searchPlaceholder?: string;
  getRowId: (row: T) => string;
  toolbar?: ReactNode;
  bulkActions?: (ids: string[], clear: () => void) => ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
};

/**
 * Table shell shared by every admin list. Pagination, sorting and search live in
 * the URL, so the server page reads them from `searchParams` and does the work
 * in the database — the client only renders.
 */
export function DataTable<T>({
  columns,
  data,
  total,
  page,
  pageSize,
  sort,
  searchPlaceholder,
  getRowId,
  toolbar,
  bulkActions,
  emptyState,
  loading = false,
}: DataTableProps<T>) {
  const router = useRouter();
  const t = useTranslations('admin');
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showColumns, setShowColumns] = useState(false);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const setParams = useMemo(
    () => (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') params.delete(key);
        else params.set(key, value);
      }
      const next = params.toString();
      router.replace(next ? `?${next}` : '?', { scroll: false });
    },
    [router, searchParams],
  );

  // Debounced search -> URL
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (query === current) return;
    const timer = window.setTimeout(() => setParams({ q: query || null, page: null }), 350);
    return () => window.clearTimeout(timer);
  }, [query, searchParams, setParams]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount,
    state: { rowSelection: selection, columnVisibility },
    enableRowSelection: Boolean(bulkActions),
    onRowSelectionChange: setSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row) => getRowId(row),
  });

  const selectedIds = Object.keys(selection).filter((id) => selection[id]);

  function toggleSort(columnId: string) {
    const isCurrent = sort?.id === columnId;
    setParams({
      sort: columnId,
      dir: isCurrent && !sort.desc ? 'desc' : 'asc',
      page: null,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-admin-muted"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder ?? t('common.searchPlaceholder')}
            aria-label={searchPlaceholder ?? t('common.search')}
            className="h-10 border-admin-border bg-admin-panel ps-10 text-admin-text"
          />
        </div>

        {toolbar}

        <div className="relative ms-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumns((value) => !value)}
            className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
          >
            <Columns3 aria-hidden />
            {t('common.columns')}
          </Button>
          {showColumns ? (
            <div className="absolute end-0 z-30 mt-2 w-56 rounded-lg border border-admin-border bg-admin-panel p-2 shadow-xl">
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide() && column.id !== 'select')
                .map((column) => (
                  <label
                    key={column.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-admin-text hover:bg-admin-hover"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-brand-600"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                    />
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </label>
                ))}
            </div>
          ) : null}
        </div>
      </div>

      {bulkActions && selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-600/40 bg-brand-50 p-3 text-ink-900 dark:bg-admin-panel dark:text-admin-text">
          <p className="text-sm font-bold text-brand-600 dark:text-admin-accent">
            {t('common.selected', { count: selectedIds.length })}
          </p>
          {bulkActions(selectedIds, () => setSelection({}))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-panel">
        {loading ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : data.length === 0 ? (
          <div className="p-4">{emptyState}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-admin-border bg-admin-hover/60">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const sortable =
                        header.column.columnDef.enableSorting !== false &&
                        header.column.id !== 'select' &&
                        header.column.id !== 'actions';
                      const active = sort?.id === header.column.id;
                      return (
                        <th
                          key={header.id}
                          scope="col"
                          className="px-4 py-3 text-start text-xs font-bold tracking-wide whitespace-nowrap text-admin-muted uppercase"
                        >
                          {header.isPlaceholder ? null : sortable ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(header.column.id)}
                              className="inline-flex items-center gap-1 hover:text-admin-text"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {active ? (
                                sort.desc ? (
                                  <ArrowDown className="size-3.5" aria-hidden />
                                ) : (
                                  <ArrowUp className="size-3.5" aria-hidden />
                                )
                              ) : null}
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-admin-border transition-colors last:border-0 hover:bg-admin-hover/70',
                      row.getIsSelected() && 'bg-brand-50/60 dark:bg-admin-hover',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle text-admin-text">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-admin-muted tabular-nums">
          {t('common.rowsSummary', {
            total,
            from: data.length ? (page - 1) * pageSize + 1 : 0,
            to: (page - 1) * pageSize + data.length,
          })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParams({ page: String(page - 1) })}
            className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="text-sm text-admin-muted tabular-nums">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setParams({ page: String(page + 1) })}
            className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Checkbox column used by tables that support bulk actions. */
export function selectionColumn<T>(label: {
  selectAll: string;
  selectRow: string;
}): ColumnDef<T, unknown> {
  return {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label={label.selectAll}
        className="size-4 accent-brand-600"
        checked={table.getIsAllRowsSelected()}
        ref={(node) => {
          if (node)
            node.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={label.selectRow}
        className="size-4 accent-brand-600"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  };
}
