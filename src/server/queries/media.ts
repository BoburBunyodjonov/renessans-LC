import { prisma } from '@/lib/prisma';

export type MediaAssetRow = {
  id: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
  folder: string;
  alt: string | null;
  createdAt: string;
};

/** Media library listing. Admin reads are never cached — staff expect them live. */
export async function listMedia({
  query = '',
  folder,
  page = 1,
  pageSize = 24,
}: {
  query?: string;
  folder?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{ rows: MediaAssetRow[]; total: number; folders: string[] }> {
  const where = {
    ...(folder ? { folder } : {}),
    ...(query ? { key: { contains: query, mode: 'insensitive' as const } } : {}),
  };

  const [rows, total, folders] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      distinct: ['folder'],
      select: { folder: true },
      orderBy: { folder: 'asc' },
    }),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      url: row.url,
      key: row.key,
      mimeType: row.mimeType,
      size: row.size,
      folder: row.folder,
      alt:
        row.alt && typeof row.alt === 'object' && !Array.isArray(row.alt)
          ? (((row.alt as Record<string, unknown>).uz as string) ?? null)
          : null,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    folders: folders.map((entry) => entry.folder),
  };
}
