import { prisma } from '@/lib/prisma';
import { TAGS, cachedQuery } from '@/lib/cache';
import { isPreview } from '@/lib/draft';
import { loc, locList, locOrNull } from '@/lib/localize';
import { asLocalized, asLocalizedList, t, type Locale } from '@/types/i18n';
import type {
  CourseCardView,
  CourseDetailView,
  CurriculumBlockView,
  TeacherView,
} from '@/types/content';

const courseSelect = {
  id: true,
  slug: true,
  title: true,
  shortDesc: true,
  description: true,
  level: true,
  durationLabel: true,
  price: true,
  priceNote: true,
  currency: true,
  publisher: true,
  coverUrl: true,
  iconUrl: true,
  curriculum: true,
  includes: true,
  schedule: true,
  hasDetailPage: true,
  isFeatured: true,
  order: true,
  seoTitle: true,
  seoDescription: true,
  updatedAt: true,
} as const;

/** Cached values must be JSON-safe: Decimal -> number, Date -> ISO string. */
function serialize<T extends { price: unknown; updatedAt: Date }>(row: T) {
  return {
    ...row,
    price: row.price ? Number(row.price) : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function fetchCourses(includeUnpublished = false) {
  const rows = await prisma.course.findMany({
    where: { deletedAt: null, ...(includeUnpublished ? {} : { isPublished: true }) },
    orderBy: { order: 'asc' },
    select: courseSelect,
  });
  return rows.map(serialize);
}

const rawCourses = cachedQuery(() => fetchCourses(), ['courses:list'], [TAGS.courses], {
  fallback: [],
});

async function fetchCourseBySlug(slug: string, includeUnpublished = false) {
  const row = await prisma.course.findFirst({
    where: { slug, deletedAt: null, ...(includeUnpublished ? {} : { isPublished: true }) },
    select: {
      ...courseSelect,
      teachers: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          slug: true,
          fullName: true,
          position: true,
          bio: true,
          photoUrl: true,
          photoAlt: true,
          ieltsScore: true,
          certificates: true,
          experience: true,
        },
      },
    },
  });
  return row ? { ...serialize(row), teachers: row.teachers } : null;
}

const rawCourseBySlug = cachedQuery(
  (slug: string) => fetchCourseBySlug(slug),
  ['courses:by-slug'],
  [TAGS.courses, TAGS.teachers],
  { fallback: null },
);

const rawCourseSlugs = cachedQuery(
  async () =>
    prisma.course.findMany({
      where: { isPublished: true, deletedAt: null, hasDetailPage: true },
      select: { slug: true, updatedAt: true },
      orderBy: { order: 'asc' },
    }),
  ['courses:slugs'],
  [TAGS.courses],
  { fallback: [] },
);

type RawCourse = Awaited<ReturnType<typeof rawCourses>>[number];

function toCard(row: RawCourse, locale: Locale): CourseCardView {
  return {
    id: row.id,
    slug: row.slug,
    title: loc(row.title, locale),
    shortDesc: loc(row.shortDesc, locale),
    level: locOrNull(row.level, locale),
    durationLabel: loc(row.durationLabel, locale),
    price: row.price,
    priceNote: locOrNull(row.priceNote, locale),
    currency: row.currency,
    publisher: row.publisher,
    coverUrl: row.coverUrl,
    iconUrl: row.iconUrl,
    hasDetailPage: row.hasDetailPage,
    isFeatured: row.isFeatured,
  };
}

function toCurriculum(value: unknown, locale: Locale): CurriculumBlockView[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((block) => {
      if (!block || typeof block !== 'object') return null;
      const record = block as Record<string, unknown>;
      const title = t(asLocalized(record.title), locale);
      const items = asLocalizedList(record.items).map((item) => t(item, locale));
      if (!title && items.length === 0) return null;
      return { title, items: items.filter(Boolean) };
    })
    .filter((block): block is CurriculumBlockView => block !== null);
}

export async function getCourses(locale: Locale): Promise<CourseCardView[]> {
  // In preview the cache is bypassed so unpublished work is visible.
  const rows = (await isPreview()) ? await fetchCourses(true) : await rawCourses();
  return rows.map((row) => toCard(row, locale));
}

export async function getCourseBySlug(
  slug: string,
  locale: Locale,
): Promise<CourseDetailView | null> {
  const row = (await isPreview())
    ? await fetchCourseBySlug(slug, true)
    : await rawCourseBySlug(slug);
  if (!row) return null;

  const teachers: TeacherView[] = row.teachers.map((teacher) => ({
    id: teacher.id,
    slug: teacher.slug,
    fullName: teacher.fullName,
    position: loc(teacher.position, locale),
    bio: locOrNull(teacher.bio, locale),
    photoUrl: teacher.photoUrl,
    photoAlt: locOrNull(teacher.photoAlt, locale),
    ieltsScore: teacher.ieltsScore,
    certificates: teacher.certificates,
    experience: teacher.experience,
  }));

  return {
    ...toCard(row, locale),
    description: locOrNull(row.description, locale),
    curriculum: toCurriculum(row.curriculum, locale),
    includes: locList(row.includes, locale),
    schedule: locList(row.schedule, locale),
    seoTitle: locOrNull(row.seoTitle, locale),
    seoDescription: locOrNull(row.seoDescription, locale),
    updatedAt: row.updatedAt,
    teachers,
  };
}

export async function getCourseSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return rawCourseSlugs();
}
