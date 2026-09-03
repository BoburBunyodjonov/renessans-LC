import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/sections/hero';
import { TickerSection } from '@/components/sections/ticker';
import { StatsSection } from '@/components/sections/stats';
import { AboutSection } from '@/components/sections/about';
import { TeachersSection } from '@/components/sections/teachers';
import { AdvantagesSection } from '@/components/sections/advantages';
import { ProblemsSection } from '@/components/sections/problems';
import { PromotionsSection } from '@/components/sections/promotions';
import { CareersTeaserSection } from '@/components/sections/careers-teaser';
import { CoursesSection } from '@/components/sections/courses';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { MaterialsTeaserSection } from '@/components/sections/materials-teaser';
import { FaqSection } from '@/components/sections/faq';
import { ContactSection } from '@/components/sections/contact';
import { getSiteSettings } from '@/server/queries/site';
import {
  getActivePromotion,
  getAdvantages,
  getBranches,
  getFaqGroups,
  getHeroSlides,
  getHomeSections,
  getMaterialCounts,
  getProblems,
  getStats,
  getTestimonials,
} from '@/server/queries/home';
import { getCourses } from '@/server/queries/courses';
import { getSuccessStories, getTeachers } from '@/server/queries/teachers';
import { faqJsonLd, organizationJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/shared/json-ld';
import type { Locale } from '@/types/i18n';

export const revalidate = 300;

/**
 * Section order and visibility come from the `HomeSection` table, so staff can
 * reorder or switch off any band from the admin (PROMPT.md §7).
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [
    t,
    settings,
    sections,
    slides,
    stats,
    advantages,
    problems,
    promotion,
    courses,
    teachers,
    stories,
    testimonials,
    faqGroups,
    materialCounts,
    branches,
  ] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getSiteSettings(typedLocale),
    getHomeSections(typedLocale),
    getHeroSlides(typedLocale),
    getStats(typedLocale),
    getAdvantages(typedLocale),
    getProblems(typedLocale),
    getActivePromotion(typedLocale),
    getCourses(typedLocale),
    getTeachers(typedLocale),
    getSuccessStories(typedLocale),
    getTestimonials(typedLocale),
    getFaqGroups(typedLocale),
    getMaterialCounts(),
    getBranches(typedLocale),
  ]);

  const section = (key: string) => sections.find((item) => item.key === key);
  const visible = (key: string) => section(key)?.isVisible !== false;

  const blocks: { key: string; node: React.ReactNode }[] = [
    {
      key: 'hero',
      node: (
        <HeroSection
          slides={slides}
          stats={stats}
          fallbackCtaLabel={settings.primaryCtaLabel}
          fallbackCtaHref={settings.primaryCtaHref}
        />
      ),
    },
    { key: 'ticker', node: <TickerSection items={settings.tickerItems} /> },
    { key: 'stats', node: <StatsSection stats={stats} section={section('stats')} /> },
    {
      key: 'about',
      node: section('about') ? <AboutSection section={section('about')!} /> : null,
    },
    {
      key: 'teachers',
      node: (
        <TeachersSection
          teachers={teachers}
          stories={stories}
          section={section('teachers')}
          fallbackTitle={t('sectionTeachers')}
        />
      ),
    },
    {
      key: 'advantages',
      node: (
        <AdvantagesSection
          advantages={advantages}
          section={section('advantages')}
          fallbackTitle={t('sectionAdvantages')}
        />
      ),
    },
    {
      key: 'problems',
      node: (
        <ProblemsSection
          problems={problems}
          section={section('problems')}
          fallbackTitle={t('sectionProblems')}
        />
      ),
    },
    { key: 'promotions', node: <PromotionsSection promotion={promotion} /> },
    {
      key: 'careers',
      node: section('careers') ? <CareersTeaserSection section={section('careers')!} /> : null,
    },
    {
      key: 'courses',
      node: <CoursesSection courses={courses} section={section('courses')} locale={typedLocale} />,
    },
    {
      key: 'testimonials',
      node: (
        <TestimonialsSection
          testimonials={testimonials}
          section={section('testimonials')}
          fallbackTitle={t('sectionTestimonials')}
        />
      ),
    },
    {
      key: 'materials',
      node: (
        <MaterialsTeaserSection
          counts={materialCounts}
          section={section('materials')}
          locale={typedLocale}
        />
      ),
    },
    {
      key: 'faq',
      node: (
        <FaqSection groups={faqGroups} section={section('faq')} fallbackTitle={t('sectionFaq')} />
      ),
    },
    {
      key: 'contact',
      node: (
        <ContactSection
          branches={branches}
          settings={settings}
          section={section('contact')}
          locale={typedLocale}
        />
      ),
    },
  ];

  const ordered = blocks
    .filter((block) => visible(block.key))
    .sort((a, b) => (section(a.key)?.order ?? 99) - (section(b.key)?.order ?? 99));

  const allFaqItems = faqGroups.flatMap((group) => group.items);

  return (
    <>
      <JsonLd data={organizationJsonLd(settings, locale)} />
      {allFaqItems.length > 0 ? <JsonLd data={faqJsonLd(allFaqItems)} /> : null}
      {ordered.map((block) => (
        <div key={block.key}>{block.node}</div>
      ))}
    </>
  );
}
