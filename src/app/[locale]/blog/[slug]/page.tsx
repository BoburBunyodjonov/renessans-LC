import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalendarDays, Clock } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { JsonLd } from '@/components/shared/json-ld';
import { ScrollProgress } from '@/components/shared/scroll-progress';
import { PostViewCounter } from '@/components/shared/post-view-counter';
import { Link } from '@/i18n/navigation';
import { getPostBySlug, getPostSlugs, getPosts } from '@/server/queries/posts';
import { getSiteSettings } from '@/server/queries/site';
import { breadcrumbJsonLd } from '@/lib/seo';
import { absoluteUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import { LOCALE_TAGS, type Locale } from '@/types/i18n';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return routing.locales.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale as Locale);
  if (!post) return {};

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const ogImage =
    post.coverUrl ??
    `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.excerpt ?? '')}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}/blog/${slug}`])),
    },
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      images: [{ url: ogImage }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [post, allPosts, settings, t, tNav] = await Promise.all([
    getPostBySlug(slug, typedLocale),
    getPosts(typedLocale),
    getSiteSettings(typedLocale),
    getTranslations({ locale, namespace: 'blog' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  if (!post) notFound();

  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const crumbs = [
    { name: tNav('home'), path: `/${locale}` },
    { name: tNav('blog'), path: `/${locale}/blog` },
    { name: post.title, path: `/${locale}/blog/${slug}` },
  ];

  const articleJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverUrl ? [post.coverUrl] : undefined,
    datePublished: post.publishedAt ?? undefined,
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(`/${locale}/blog/${slug}`),
    publisher: {
      '@type': 'Organization',
      name: settings.brandName,
      ...(settings.logoLightUrl
        ? { logo: { '@type': 'ImageObject', url: settings.logoLightUrl } }
        : {}),
    },
  };

  return (
    <>
      <ScrollProgress />
      <PostViewCounter slug={slug} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <Container className="pt-8">
        <Breadcrumbs items={crumbs} />
      </Container>

      <article>
        <Container className="max-w-3xl pt-6 pb-4">
          {post.tags.length > 0 ? (
            <ul className="mb-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="brand">{tag}</Badge>
                </li>
              ))}
            </ul>
          ) : null}

          <h1 className="text-3xl md:text-4xl lg:text-5xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-600">
            {post.publishedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {new Date(post.publishedAt).toLocaleDateString(LOCALE_TAGS[typedLocale], {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            ) : null}
            {post.readingMinutes ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {t('readingTime', { minutes: post.readingMinutes })}
              </span>
            ) : null}
          </div>
        </Container>

        {post.coverUrl ? (
          <Container className="max-w-4xl">
            <div className="relative aspect-16/9 w-full overflow-hidden rounded-lg">
              <Image
                src={post.coverUrl}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 900px, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        ) : null}

        <Container className="max-w-3xl py-10">
          <div
            className="legal-copy text-base text-ink-600 md:text-lg"
            // Sanitized in the admin on save.
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </Container>
      </article>

      {related.length > 0 ? (
        <Section tone="alt">
          <h2 className="mb-6 text-2xl md:text-3xl">{t('related')}</h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="block h-full rounded-lg border border-ink-300/40 bg-white p-5 shadow-card transition-transform hover:-translate-y-1"
                >
                  <h3 className="text-lg">{item.title}</h3>
                  {item.excerpt ? (
                    <p className="mt-2 line-clamp-2 text-sm text-ink-600">{item.excerpt}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link href="/blog">{t('backToBlog')}</Link>
            </Button>
          </div>
        </Section>
      ) : null}
    </>
  );
}
