import { prisma } from '@/lib/prisma';
import { TAGS, cachedQuery } from '@/lib/cache';
import { loc, locOrNull } from '@/lib/localize';
import type { Locale } from '@/types/i18n';
import type { SuccessStoryView, TeacherView } from '@/types/content';

const rawTeachers = cachedQuery(
  async () =>
    prisma.teacher.findMany({
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
    }),
  ['teachers:list'],
  [TAGS.teachers],
  { fallback: [] },
);

const rawSuccessStories = cachedQuery(
  async () =>
    prisma.successStory.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
    }),
  ['success-stories:list'],
  [TAGS.teachers],
  { fallback: [] },
);

export async function getTeachers(locale: Locale): Promise<TeacherView[]> {
  const rows = await rawTeachers();
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    fullName: row.fullName,
    position: loc(row.position, locale),
    bio: locOrNull(row.bio, locale),
    photoUrl: row.photoUrl,
    photoAlt: locOrNull(row.photoAlt, locale),
    ieltsScore: row.ieltsScore,
    certificates: row.certificates,
    experience: row.experience,
  }));
}

export async function getSuccessStories(locale: Locale): Promise<SuccessStoryView[]> {
  const rows = await rawSuccessStories();
  return rows.map((row) => {
    const scores: Record<string, string> = {};
    if (row.scores && typeof row.scores === 'object' && !Array.isArray(row.scores)) {
      for (const [key, value] of Object.entries(row.scores as Record<string, unknown>)) {
        if (typeof value === 'string') scores[key] = value;
      }
    }
    return {
      id: row.id,
      studentName: row.studentName,
      overallBand: row.overallBand,
      scores,
      imageUrl: row.imageUrl,
      quote: locOrNull(row.quote, locale),
    };
  });
}
