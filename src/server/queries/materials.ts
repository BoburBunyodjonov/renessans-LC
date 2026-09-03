import { prisma } from '@/lib/prisma';
import { TAGS, cachedQuery } from '@/lib/cache';
import { loc, locOrNull } from '@/lib/localize';
import type { Locale } from '@/types/i18n';
import type {
  MaterialGroupView,
  MaterialLevelKey,
  MaterialTypeKey,
  MaterialView,
} from '@/types/content';

const materialSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  level: true,
  fileUrl: true,
  externalUrl: true,
  coverUrl: true,
  fileSize: true,
  meta: true,
  tags: true,
  requireContact: true,
  downloadCount: true,
  group: { select: { id: true, name: true, type: true } },
} as const;

const rawMaterialsByType = cachedQuery(
  async (type: MaterialTypeKey) =>
    prisma.material.findMany({
      where: { type, isPublished: true, deletedAt: null },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: materialSelect,
    }),
  ['materials:by-type'],
  [TAGS.materials],
  { fallback: [] },
);

const rawGroupsByType = cachedQuery(
  async (type: MaterialTypeKey) =>
    prisma.materialGroup.findMany({ where: { type }, orderBy: { order: 'asc' } }),
  ['materials:groups-by-type'],
  [TAGS.materials],
  { fallback: [] },
);

type RawMaterial = Awaited<ReturnType<typeof rawMaterialsByType>>[number];

function toMeta(value: unknown): MaterialView['meta'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const out: MaterialView['meta'] = {};
  for (const key of ['pages', 'durationSec', 'width', 'height'] as const) {
    const raw = record[key];
    if (typeof raw === 'number') out[key] = raw;
  }
  return out;
}

function toView(row: RawMaterial, locale: Locale): MaterialView {
  return {
    id: row.id,
    title: loc(row.title, locale),
    description: locOrNull(row.description, locale),
    type: row.type,
    level: row.level,
    group: row.group
      ? { id: row.group.id, name: loc(row.group.name, locale), type: row.group.type }
      : null,
    fileUrl: row.fileUrl,
    externalUrl: row.externalUrl,
    coverUrl: row.coverUrl,
    fileSize: row.fileSize,
    meta: toMeta(row.meta),
    tags: row.tags,
    requireContact: row.requireContact,
    downloadCount: row.downloadCount,
  };
}

export async function getMaterialsByType(
  type: MaterialTypeKey,
  locale: Locale,
): Promise<MaterialView[]> {
  const rows = await rawMaterialsByType(type);
  return rows.map((row) => toView(row, locale));
}

export async function getMaterialGroups(
  type: MaterialTypeKey,
  locale: Locale,
): Promise<MaterialGroupView[]> {
  const rows = await rawGroupsByType(type);
  return rows.map((row) => ({ id: row.id, name: loc(row.name, locale), type: row.type }));
}

/** Levels actually present in the published set, in enum order. */
export async function getMaterialLevels(type: MaterialTypeKey): Promise<MaterialLevelKey[]> {
  const rows = await rawMaterialsByType(type);
  const order: MaterialLevelKey[] = [
    'BEGINNER',
    'ELEMENTARY',
    'PRE_INTERMEDIATE',
    'INTERMEDIATE',
    'UPPER_INTERMEDIATE',
    'ADVANCED',
    'IELTS',
    'KIDS',
  ];
  const present = new Set(rows.map((row) => row.level).filter(Boolean) as MaterialLevelKey[]);
  return order.filter((level) => present.has(level));
}

/** Uncached: used by the download route, which also mutates counters. */
export async function findDownloadableMaterial(id: string) {
  return prisma.material.findFirst({
    where: { id, isPublished: true, deletedAt: null },
    select: { id: true, fileUrl: true, externalUrl: true, requireContact: true, title: true },
  });
}
