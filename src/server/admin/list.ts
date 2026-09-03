import { prisma } from '@/lib/prisma';
import { delegateFor, resourceConfig } from '@/server/admin/records';
import type { RecordData } from '@/server/admin/delegates';
import type { RelationSource, ResourceConfig } from '@/config/admin-resources';

export type ListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
};

export type ListResult = {
  rows: RecordData[];
  total: number;
  page: number;
  pageSize: number;
  sort: { id: string; desc: boolean };
};

/** Server-side pagination, sorting and search for a registered resource. */
export async function listRecords(
  config: ResourceConfig,
  params: ListParams = {},
): Promise<ListResult> {
  const delegate = delegateFor(config.key);
  if (!delegate) throw new Error(`No delegate for ${config.key}`);

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, params.pageSize ?? 20));

  const defaultSort = config.defaultSort ?? {
    id: config.ordered ? 'order' : 'createdAt',
    desc: !config.ordered,
  };
  const sortId = params.sort ?? defaultSort.id;
  const desc = params.dir ? params.dir === 'desc' : defaultSort.desc;

  const where: RecordData = {};
  if (delegate.softDelete) where.deletedAt = null;

  const search = params.q?.trim();
  if (search && config.searchField) {
    if (config.searchField.localized) {
      // Localized columns are JSON: match the uz value, which is always present.
      where[config.searchField.name] = {
        path: ['uz'],
        string_contains: search,
      };
    } else {
      where[config.searchField.name] = { contains: search, mode: 'insensitive' };
    }
  }

  const [rows, total] = await Promise.all([
    delegate.model.findMany({
      where,
      orderBy: { [sortId]: desc ? 'desc' : 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      ...(delegate.include ? { include: delegate.include } : {}),
    }),
    delegate.model.count({ where }),
  ]);

  return { rows, total, page, pageSize, sort: { id: sortId, desc } };
}

export async function getRecord(config: ResourceConfig, id: string): Promise<RecordData | null> {
  const delegate = delegateFor(config.key);
  if (!delegate) return null;
  return delegate.model.findUnique({
    where: { id },
    ...(delegate.include ? { include: delegate.include } : {}),
  });
}

/** Options for `relation` fields. */
export async function relationOptions(
  source: RelationSource,
): Promise<{ value: string; label: string }[]> {
  const label = (value: unknown, fallback: string) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const uz = (value as Record<string, unknown>).uz;
      if (typeof uz === 'string' && uz.trim()) return uz;
    }
    return fallback;
  };

  switch (source) {
    case 'materialGroups': {
      const rows = await prisma.materialGroup.findMany({ orderBy: { order: 'asc' } });
      return rows.map((row) => ({
        value: row.id,
        label: `${label(row.name, row.id)} · ${row.type}`,
      }));
    }
    case 'faqCategories': {
      const rows = await prisma.faqCategory.findMany({ orderBy: { order: 'asc' } });
      return rows.map((row) => ({ value: row.id, label: label(row.name, row.id) }));
    }
    case 'courses': {
      const rows = await prisma.course.findMany({
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
      });
      return rows.map((row) => ({ value: row.id, label: label(row.title, row.slug) }));
    }
    case 'teachers': {
      const rows = await prisma.teacher.findMany({ orderBy: { order: 'asc' } });
      return rows.map((row) => ({ value: row.id, label: row.fullName }));
    }
  }
}

export { resourceConfig };
