import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/ui';
import { QuestionBank } from '@/components/admin/question-bank';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import { asLocalized, type Localized } from '@/types/i18n';

export const dynamic = 'force-dynamic';

const EMPTY: Localized = { uz: '', ru: '', en: '' };

const localizedUz = (value: unknown, fallback: string): string => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uz = (value as Record<string, unknown>).uz;
    if (typeof uz === 'string' && uz.trim()) return uz;
  }
  return fallback;
};

export default async function QuestionBankPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await currentUser();
  if (!can(user?.role, 'viewTests')) redirect('/admin');

  const t = await getTranslations('admin');
  const category = await prisma.testCategory.findUnique({
    where: { slug },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
      bands: { orderBy: { minScore: 'asc' } },
    },
  });
  if (!category) notFound();

  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
    select: { id: true, title: true },
    orderBy: { order: 'asc' },
  });

  return (
    <>
      <PageHeader
        title={localizedUz(category.title, category.slug)}
        description={t('tests.summary', {
          questions: category.questions.length,
          bands: category.bands.length,
        })}
      />
      <QuestionBank
        categoryId={category.id}
        slug={category.slug}
        canEdit={can(user?.role, 'manageTests')}
        questions={category.questions.map((question) => ({
          id: question.id,
          prompt: question.prompt,
          explanation: question.explanation,
          points: question.points,
          difficulty: question.difficulty,
          isActive: question.isActive,
          answerType: question.answerType,
          acceptedAnswers: question.acceptedAnswers,
          imageUrl: question.imageUrl,
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        }))}
        bands={category.bands.map((band) => ({
          id: band.id,
          minScore: band.minScore,
          maxScore: band.maxScore,
          levelName: band.levelName,
          title: asLocalized(band.title) ?? EMPTY,
          description: asLocalized(band.description) ?? EMPTY,
          courseId: band.courseId,
        }))}
        courses={courses.map((course) => ({
          value: course.id,
          label: localizedUz(course.title, course.id),
        }))}
      />
    </>
  );
}
