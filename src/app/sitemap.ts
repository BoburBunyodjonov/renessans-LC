import type { MetadataRoute } from 'next';
import { getCourseSlugs } from '@/server/queries/courses';
import { getPostSlugs } from '@/server/queries/posts';
import { getVacancySlugs } from '@/server/queries/careers';
import { getTestCategorySlugs } from '@/server/queries/tests';
import { absoluteUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;

/** Every published URL in all three locales, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, posts, vacancies, tests] = await Promise.all([
    getCourseSlugs(),
    getPostSlugs(),
    getVacancySlugs(),
    getTestCategorySlugs(),
  ]);

  const staticPaths: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }[] = [
    { path: '', priority: 1, changeFrequency: 'daily' },
    { path: '/teachers', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/parents-solutions', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/choose-level', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/materials', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/materials/pdf', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/materials/audio', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/materials/video', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/materials/photo', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/join-team', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const entries: MetadataRoute.Sitemap = [];

  const withAlternates = (
    path: string,
    options: {
      lastModified?: Date;
      priority?: number;
      changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
    } = {},
  ) => {
    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(`/${locale}${path}`),
        lastModified: options.lastModified ?? new Date(),
        changeFrequency: options.changeFrequency ?? 'monthly',
        priority: options.priority ?? 0.5,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((alternate) => [alternate, absoluteUrl(`/${alternate}${path}`)]),
          ),
        },
      });
    }
  };

  for (const entry of staticPaths) {
    withAlternates(entry.path, {
      priority: entry.priority,
      changeFrequency: entry.changeFrequency,
    });
  }

  for (const course of courses) {
    withAlternates(`/courses/${course.slug}`, {
      lastModified: course.updatedAt,
      priority: 0.9,
      changeFrequency: 'weekly',
    });
  }

  for (const post of posts) {
    withAlternates(`/blog/${post.slug}`, {
      lastModified: post.publishedAt ? new Date(post.publishedAt) : undefined,
      priority: 0.6,
      changeFrequency: 'monthly',
    });
  }

  for (const slug of vacancies) {
    withAlternates(`/join-team/${slug}`, { priority: 0.5, changeFrequency: 'weekly' });
  }

  for (const slug of tests) {
    withAlternates(`/tests/${slug}`, { priority: 0.4, changeFrequency: 'monthly' });
  }

  return entries;
}
