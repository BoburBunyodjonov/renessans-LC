import Image from 'next/image';
import { Section, SectionHeader } from '@/components/ui/section';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/shared/reveal';
import type { HomeSectionView, SuccessStoryView, TeacherView } from '@/types/content';
import { cn } from '@/lib/utils';

export function TeacherCard({
  teacher,
  className,
  priority = false,
}: {
  teacher: TeacherView;
  className?: string;
  /**
   * Set on the first card of the teachers page, where the photo is the largest
   * element above the fold. Without it the image is lazy-loaded and the fetch
   * only starts after layout, which cost ~1.5s of load delay on a throttled
   * connection. Cards further down stay lazy.
   */
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        'group flex shrink-0 flex-col overflow-hidden rounded-lg border border-ink-300/40 bg-white shadow-card transition-transform hover:-translate-y-1',
        className,
      )}
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-paper-alt">
        {teacher.photoUrl ? (
          <Image
            src={teacher.photoUrl}
            alt={teacher.photoAlt ?? teacher.fullName}
            fill
            sizes="(min-width: 1024px) 300px, 70vw"
            className="object-cover"
            priority={priority}
          />
        ) : null}
        {teacher.ieltsScore ? (
          <span className="absolute start-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
            IELTS {teacher.ieltsScore}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg">{teacher.fullName}</h3>
        <p className="text-sm font-semibold text-brand-600">{teacher.position}</p>
        {teacher.bio ? <p className="line-clamp-3 text-sm text-ink-600">{teacher.bio}</p> : null}
        {teacher.certificates.length > 0 ? (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {teacher.certificates.map((certificate) => (
              <li key={certificate}>
                <Badge variant="outline">{certificate}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

function SuccessCard({ story }: { story: SuccessStoryView }) {
  const scores = Object.entries(story.scores);

  return (
    <article className="flex w-[16rem] shrink-0 flex-col gap-4 rounded-lg bg-brand-600 p-6 text-white shadow-brand md:w-auto">
      <p className="text-xs font-bold tracking-[0.18em] uppercase">Overall band</p>
      <p className="font-display text-6xl leading-none font-extrabold tabular-nums">
        {story.overallBand}
      </p>
      <p className="text-sm font-semibold">{story.studentName}</p>
      {scores.length > 0 ? (
        <ul className="grid grid-cols-2 gap-1.5 text-xs">
          {scores.map(([skill, score]) => (
            <li key={skill} className="flex justify-between gap-2 rounded-sm bg-black/20 px-2 py-1">
              <span className="capitalize">{skill}</span>
              <span className="font-bold tabular-nums">{score}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {story.quote ? <p className="mt-auto text-sm">“{story.quote}”</p> : null}
    </article>
  );
}

export function TeachersSection({
  teachers,
  stories,
  section,
  fallbackTitle,
}: {
  teachers: TeacherView[];
  stories: SuccessStoryView[];
  section?: HomeSectionView;
  fallbackTitle: string;
}) {
  if (teachers.length === 0 && stories.length === 0) return null;

  return (
    <Section id="teachers" tone="alt">
      <SectionHeader
        eyebrow={section?.eyebrow ?? undefined}
        title={section?.title ?? fallbackTitle}
        subtitle={section?.subtitle ?? undefined}
      />

      <Reveal>
        {/* Snap-scroll carousel on mobile, grid from lg up. */}
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:-mx-8 md:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              className="w-[16rem] snap-start md:w-[18rem] lg:w-auto"
            />
          ))}
          {stories.map((story) => (
            <div key={story.id} className="snap-start">
              <SuccessCard story={story} />
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
