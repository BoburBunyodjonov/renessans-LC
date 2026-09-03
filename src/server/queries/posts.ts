import { prisma } from '@/lib/prisma';
import { TAGS, cachedQuery } from '@/lib/cache';
import { loc, locOrNull } from '@/lib/localize';
import type { Locale } from '@/types/i18n';
import type { PostCardView, PostDetailView } from '@/types/content';

const postSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverUrl: true,
  tags: true,
  readingMinutes: true,
  publishedAt: true,
} as const;

const rawPosts = cachedQuery(
  async () => {
    const rows = await prisma.post.findMany({
      where: { isPublished: true, publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      select: postSelect,
    });
    return rows.map((row) => ({ ...row, publishedAt: row.publishedAt?.toISOString() ?? null }));
  },
  ['posts:list'],
  [TAGS.posts],
  { fallback: [] },
);

const rawPostBySlug = cachedQuery(
  async (slug: string) => {
    const row = await prisma.post.findFirst({
      where: { slug, isPublished: true },
      select: { ...postSelect, body: true, seoTitle: true, seoDescription: true },
    });
    return row ? { ...row, publishedAt: row.publishedAt?.toISOString() ?? null } : null;
  },
  ['posts:by-slug'],
  [TAGS.posts],
  { fallback: null },
);

type RawPost = Awaited<ReturnType<typeof rawPosts>>[number];

function toCard(row: RawPost, locale: Locale): PostCardView {
  return {
    id: row.id,
    slug: row.slug,
    title: loc(row.title, locale),
    excerpt: locOrNull(row.excerpt, locale),
    coverUrl: row.coverUrl,
    tags: row.tags,
    readingMinutes: row.readingMinutes,
    publishedAt: row.publishedAt,
  };
}

export async function getPosts(locale: Locale): Promise<PostCardView[]> {
  const rows = await rawPosts();
  return rows.map((row) => toCard(row, locale));
}

export async function getPostBySlug(slug: string, locale: Locale): Promise<PostDetailView | null> {
  const row = await rawPostBySlug(slug);
  if (!row) return null;

  return {
    ...toCard(row, locale),
    body: loc(row.body, locale),
    seoTitle: locOrNull(row.seoTitle, locale),
    seoDescription: locOrNull(row.seoDescription, locale),
  };
}

export async function getPostSlugs(): Promise<{ slug: string; publishedAt: string | null }[]> {
  const rows = await rawPosts();
  return rows.map((row) => ({ slug: row.slug, publishedAt: row.publishedAt }));
}
