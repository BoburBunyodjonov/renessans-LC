import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Section, SectionHeader } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { TeacherCard } from '@/components/sections/teachers';
import { getSuccessStories, getTeachers } from '@/server/queries/teachers';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/types/i18n';

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
  const t = await getTranslations({ locale, namespace: 'pages' });
  return {
    title: t('teachersTitle'),
    description: t('teachersSubtitle'),
    alternates: {
      canonical: `/${locale}/teachers`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}/teachers`])),
    },
  };
}

export default async function TeachersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const typedLocale = locale as Locale;

  const [teachers, stories, t, tNav] = await Promise.all([
    getTeachers(typedLocale),
    getSuccessStories(typedLocale),
    getTranslations({ locale, namespace: 'pages' }),
    getTranslations({ locale, namespace: 'nav' }),
  ]);

  return (
    <>
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: tNav('home'), path: `/${locale}` },
            { name: tNav('teachers'), path: `/${locale}/teachers` },
          ]}
        />
      </Container>

      <Section tone="paper" className="pt-8 md:pt-10">
        <SectionHeader title={t('teachersTitle')} subtitle={t('teachersSubtitle')} />
        <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teachers.map((teacher, index) => (
            // The first row is inside the opening viewport: it renders visible
            // so the LCP photo does not wait for the reveal observer.
            <RevealItem as="li" key={teacher.id} immediate={index < 4}>
              <TeacherCard teacher={teacher} priority={index === 0} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {stories.length > 0 ? (
        <Section tone="alt">
          <SectionHeader title="IELTS" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <li
                key={story.id}
                className="flex flex-col gap-3 rounded-lg bg-brand-600 p-6 text-white shadow-brand"
              >
                <p className="text-xs font-bold tracking-[0.18em] uppercase">Overall band</p>
                <p className="font-display text-5xl leading-none font-extrabold tabular-nums">
                  {story.overallBand}
                </p>
                <p className="text-sm font-semibold">{story.studentName}</p>
                {Object.keys(story.scores).length > 0 ? (
                  <ul className="grid grid-cols-2 gap-1.5 text-xs">
                    {Object.entries(story.scores).map(([skill, score]) => (
                      <li
                        key={skill}
                        className="flex justify-between gap-2 rounded-sm bg-white/15 px-2 py-1"
                      >
                        <span className="capitalize">{skill}</span>
                        <span className="font-bold tabular-nums">{score}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {story.quote ? <p className="text-sm">“{story.quote}”</p> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
