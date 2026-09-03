'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { SortableList } from '@/components/admin/sortable-list';
import { EmptyState, StatusPill } from '@/components/admin/ui';
import { describeError } from '@/components/admin/form-shell';
import { reorderRecords, togglePublished } from '@/server/actions/content';
import type { ResourceConfig } from '@/config/admin-resources';

type Row = Record<string, unknown>;

function primaryLabel(config: ResourceConfig, row: Row): string {
  const first = config.columns[0];
  const value = first ? row[first.name] : null;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uz = (value as Record<string, unknown>).uz;
    if (typeof uz === 'string' && uz.trim()) return uz;
  }
  return typeof value === 'string' && value ? value : String(row.id);
}

/** List + drag-reorder view for resources that carry an `order` column. */
export function ReorderPanel({ config, rows }: { config: ResourceConfig; rows: Row[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Hozircha yozuv yo‘q"
        description={`Birinchi "${config.singular.toLowerCase()}" yozuvini qo‘shing.`}
      />
    );
  }

  const items = rows.map((row) => ({ id: String(row.id), row }));

  return (
    <SortableList
      items={items}
      onReorder={(orderedIds) => reorderRecords(config.key, orderedIds)}
      renderItem={({ row }) => {
        const published = config.publishField ? Boolean(row[config.publishField]) : null;
        const image = typeof row.imageUrl === 'string' ? row.imageUrl : null;

        return (
          <div className="flex items-center gap-3">
            {image ? (
              <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-admin-hover">
                <Image src={image} alt="" fill sizes="40px" className="object-cover" />
              </span>
            ) : null}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-admin-text">
                {primaryLabel(config, row)}
              </p>
              {typeof row.href === 'string' ? (
                <p className="truncate text-xs text-admin-muted">{row.href}</p>
              ) : null}
            </div>

            {published !== null ? (
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    const result = await togglePublished(config.key, String(row.id), !published);
                    if (result.ok) {
                      toast.success(!published ? 'Chop etildi' : 'Yashirildi');
                      router.refresh();
                    } else {
                      toast.error(describeError(result.error));
                    }
                  })
                }
              >
                <StatusPill tone={published ? 'success' : 'neutral'}>
                  {published ? 'Chop etilgan' : 'Yashirin'}
                </StatusPill>
              </button>
            ) : null}

            <Link
              href={`/admin/${config.key}/${String(row.id)}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <Pencil className="size-4" aria-hidden />
              Tahrirlash
            </Link>
          </div>
        );
      }}
    />
  );
}
