import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Clock } from 'lucide-react';
import { Section, SectionHeader } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { CtaButton } from '@/components/shared/cta-button';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import { LOCALE_TAGS, type Locale } from '@/types/i18n';
import type { CourseCardView, HomeSectionView } from '@/types/content';

export function CoursePrice({
  course,
  locale,
  className,
}: {
  course: CourseCardView;
  locale: Locale;
  className?: string;
}) {
  const price = formatPrice(course.price, LOCALE_TAGS[locale]);
  if (!price) return null;

  return (
    <p className={className}>
      <span className="font-display text-2xl font-extrabold text-ink-900">
        {price} {course.currency}
      </span>
      {course.priceNote ? (
        <span className="ms-2 text-sm font-medium text-ink-600">{course.priceNote}</span>
      ) : null}
    </p>
  );
}

export async function CoursesSection({
  courses,
  section,
  locale,
}: {
  courses: CourseCardView[];
  section?: HomeSectionView;
  locale: Locale;
}) {
  if (courses.length === 0) return null;
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <Section id="services" tone="paper">
      <SectionHeader
        eyebrow={section?.eyebrow ?? undefined}
        title={section?.title ?? t('sectionCourses')}
        subtitle={section?.subtitle ?? undefined}
      />

      <RevealGroup as="ul" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <RevealItem
            as="li"
            key={course.id}
            className="flex flex-col overflow-hidden rounded-lg border border-ink-300/40 bg-white shadow-card transition-transform hover:-translate-y-1"
          >
            {course.coverUrl ? (
              <div className="relative aspect-16/10 w-full">
                <Image
                  src={course.coverUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                {course.publisher ? (
                  <Badge variant="ink" className="absolute start-3 top-3">
                    {course.publisher}
                  </Badge>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">
                  <Clock className="size-3.5" aria-hidden />
                  {course.durationLabel}
                </Badge>
                {course.level ? <Badge variant="outline">{course.level}</Badge> : null}
              </div>

              <h3 className="text-xl">{course.title}</h3>
              <p className="text-sm text-ink-600">{course.shortDesc}</p>

              <CoursePrice course={course} locale={locale} className="mt-auto pt-2" />

              <div className="flex flex-wrap gap-2 pt-2">
                <CtaButton source="COURSE_CARD" courseId={course.id} size="sm">
                  {t('heroCta')}
                </CtaButton>
                {course.hasDetailPage ? (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/courses/${course.slug}`}>
                      {tCommon('readMore')}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
