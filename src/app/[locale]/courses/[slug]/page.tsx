import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Check, Clock, GraduationCap, BookOpen } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Section, SectionHeader } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/shared/reveal';
import { CtaButton } from '@/components/shared/cta-button';
import { LeadForm } from '@/components/shared/lead-form';
import { TeacherCard } from '@/components/sections/teachers';
import { JsonLd } from '@/components/shared/json-ld';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { getCourseBySlug, getCourseSlugs } from '@/server/queries/courses';
import { getSiteSettings } from '@/server/queries/site';
import { breadcrumbJsonLd, courseJsonLd } from '@/lib/seo';
import { formatPrice } from '@/lib/utils';
import { routing } from '@/i18n/routing';
import { LOCALE_TAGS, type Locale } from '@/types/i18n';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return routing.locales.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await getCourseBySlug(slug, locale as Locale);
  if (!course) return {};

  return {
    title: course.seoTitle ?? course.title,
    description: course.seoDescription ?? course.shortDesc,
    alternates: {
      canonical: `/${locale}/courses/${slug}`,
      languages: Object.fromEntries(
        routing.locales.map((item) => [item, `/${item}/courses/${slug}`]),
      ),
    },
    openGraph: {
      title: course.seoTitle ?? course.title,
      description: course.seoDescription ?? course.shortDesc,
      images: [
        {
          url:
            course.coverUrl ??
            `/api/og?title=${encodeURIComponent(course.title)}&subtitle=${encodeURIComponent(course.shortDesc)}&badge=${encodeURIComponent(course.durationLabel)}`,
        },
      ],
      type: 'article',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [course, settings, t, tCourse, tNav] = await Promise.all([
    getCourseBySlug(slug, typedLocale),
    getSiteSettings(typedLocale),
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'course' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  if (!course) notFound();

  const price = formatPrice(course.price, LOCALE_TAGS[typedLocale]);
  const crumbs = [
    { name: tNav('home'), path: `/${locale}` },
    { name: tNav('courses'), path: `/${locale}#services` },
    { name: course.title, path: `/${locale}/courses/${slug}` },
  ];

  return (
    <>
      <JsonLd data={courseJsonLd(course, settings, locale)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <section className="relative overflow-hidden bg-ink-900 text-white">
        {course.coverUrl ? (
          <Image
            src={course.coverUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            priority
          />
        ) : null}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink-900 to-ink-900/70" />

        <Container className="relative z-10 py-12 md:py-20">
          <Breadcrumbs items={crumbs} tone="dark" />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="light">
              <Clock className="size-3.5" aria-hidden />
              {course.durationLabel}
            </Badge>
            {course.level ? <Badge variant="light">{course.level}</Badge> : null}
            {course.publisher ? <Badge variant="light">{course.publisher}</Badge> : null}
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl text-white md:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">{course.shortDesc}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <CtaButton source="COURSE_PAGE" courseId={course.id} variant="brand" size="lg">
              {tCourse('enroll')}
            </CtaButton>
            {price ? (
              <p className="font-display text-2xl font-extrabold md:text-3xl">
                {price} {course.currency}
                {course.priceNote ? (
                  <span className="ms-2 text-sm font-medium text-white/70">{course.priceNote}</span>
                ) : null}
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-10">
            {course.description ? (
              <Reveal>
                <div
                  className="flex flex-col gap-4 text-base text-ink-600 md:text-lg"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              </Reveal>
            ) : null}

            {course.curriculum.length > 0 ? (
              <Reveal>
                <h2 className="mb-5 text-2xl md:text-3xl">{tCourse('curriculum')}</h2>
                <ol className="flex flex-col gap-4">
                  {course.curriculum.map((block, index) => (
                    <li
                      key={`${block.title}-${index}`}
                      className="rounded-lg border border-ink-300/40 bg-white p-5 md:p-6"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-50 font-display font-extrabold text-brand-600">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg">{block.title}</h3>
                          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink-600">
                            {block.items.map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <Check
                                  className="mt-0.5 size-4 shrink-0 text-success"
                                  aria-hidden
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            ) : null}

            {course.includes.length > 0 ? (
              <Reveal>
                <h2 className="mb-5 text-2xl md:text-3xl">{tCourse('includes')}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {course.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-md bg-paper-alt p-4 text-sm text-ink-600"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {course.schedule.length > 0 ? (
              <Reveal>
                <h2 className="mb-5 text-2xl md:text-3xl">{tCourse('schedule')}</h2>
                <ul className="flex flex-wrap gap-3">
                  {course.schedule.map((item) => (
                    <li key={item}>
                      <Badge variant="outline" size="md">
                        <Clock className="size-3.5" aria-hidden />
                        {item}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-ink-300/40 bg-white p-6 shadow-card md:p-7">
              <h2 className="text-xl">{t('heroCta')}</h2>
              <p className="mt-1 mb-5 text-sm text-ink-600">{course.shortDesc}</p>
              <LeadForm source="COURSE_PAGE" courseId={course.id} />
            </div>

            <ul className="mt-5 flex flex-col gap-3 text-sm text-ink-600">
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-brand-500" aria-hidden />
                {tCourse('duration')}:{' '}
                <strong className="text-ink-900">{course.durationLabel}</strong>
              </li>
              {course.level ? (
                <li className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-brand-500" aria-hidden />
                  {tCourse('level')}: <strong className="text-ink-900">{course.level}</strong>
                </li>
              ) : null}
              {course.publisher ? (
                <li className="flex items-center gap-2">
                  <BookOpen className="size-4 text-brand-500" aria-hidden />
                  {tCourse('publisher')}:{' '}
                  <strong className="text-ink-900">{course.publisher}</strong>
                </li>
              ) : null}
            </ul>
          </aside>
        </div>
      </Section>

      {course.teachers.length > 0 ? (
        <Section tone="alt">
          <SectionHeader title={tCourse('teachers')} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {course.teachers.map((teacher) => (
              <li key={teacher.id}>
                <TeacherCard teacher={teacher} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
