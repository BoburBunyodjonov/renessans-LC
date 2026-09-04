import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CalendarDays, Clock } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { Link } from '@/i18n/navigation';
import { getPosts } from '@/server/queries/posts';
import { routing } from '@/i18n/routing';
import { LOCALE_TAGS, type Locale } from '@/types/i18n';

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}/blog`])),
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [posts, t, tNav] = await Promise.all([
    getPosts(typedLocale),
    getTranslations({ locale, namespace: 'blog' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: tNav('home'), path: `/${locale}` },
            { name: tNav('blog'), path: `/${locale}/blog` },
          ]}
        />
      </Container>

      <Section tone="paper" className="pt-8 md:pt-10">
        <SectionHeader title={t('title')} subtitle={t('subtitle')} />

        {posts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink-300/50 p-10 text-center text-ink-600">
            {t('empty')}
          </p>
        ) : (
          <RevealGroup as="ul" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              // First row is above the fold; see the teachers page.
              <RevealItem as="li" key={post.id} immediate={index < 3}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-ink-300/40 bg-white shadow-card transition-transform hover:-translate-y-1"
                >
                  {post.coverUrl ? (
                    <div className="relative aspect-16/10 w-full">
                      <Image
                        src={post.coverUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                        // First cover is above the fold and is the page's LCP
                        // element; lazy-loading it delays the fetch until layout.
                        priority={index === 0}
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    {post.tags.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <li key={tag}>
                            <Badge variant="brand">{tag}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <h2 className="text-xl">{post.title}</h2>
                    {post.excerpt ? (
                      <p className="line-clamp-3 text-sm text-ink-600">{post.excerpt}</p>
                    ) : null}

                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-ink-600">
                      {post.publishedAt ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" aria-hidden />
                          {new Date(post.publishedAt).toLocaleDateString(LOCALE_TAGS[typedLocale], {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      ) : null}
                      {post.readingMinutes ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5" aria-hidden />
                          {t('readingTime', { minutes: post.readingMinutes })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Section>
    </>
  );
}
