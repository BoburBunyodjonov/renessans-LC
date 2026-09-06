import { prisma } from '@/lib/prisma';
import { TAGS, cachedQuery } from '@/lib/cache';
import { loc, locOrNull } from '@/lib/localize';
import type { Locale } from '@/types/i18n';
import type {
  CourseCardView,
  TestBandView,
  TestCategoryCardView,
  TestRunnerView,
} from '@/types/content';

const rawCategories = cachedQuery(
  async () =>
    prisma.testCategory.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        icon: true,
        timeLimitSec: true,
        requireContact: true,
        allowBack: true,
        shuffle: true,
        _count: { select: { questions: { where: { isActive: true } } } },
      },
    }),
  ['tests:categories'],
  [TAGS.tests],
  { fallback: [] },
);

/**
 * Public question bank for one category. `isCorrect` is deliberately not
 * selected — answers are graded on the server (PROMPT.md §8).
 */
const rawQuestions = cachedQuery(
  async (slug: string) =>
    prisma.testQuestion.findMany({
      where: { isActive: true, category: { slug, isPublished: true } },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        prompt: true,
        answerType: true,
        imageUrl: true,
        audioUrl: true,
        points: true,
        options: {
          orderBy: { order: 'asc' },
          select: { id: true, text: true },
        },
      },
    }),
  ['tests:questions'],
  [TAGS.tests],
  { fallback: [] },
);

const rawBands = cachedQuery(
  async (slug: string) =>
    prisma.testLevelBand.findMany({
      where: { category: { slug } },
      orderBy: { minScore: 'asc' },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            shortDesc: true,
            level: true,
            durationLabel: true,
            price: true,
            priceNote: true,
            currency: true,
            publisher: true,
            coverUrl: true,
            iconUrl: true,
            hasDetailPage: true,
            isFeatured: true,
          },
        },
      },
    }),
  ['tests:bands'],
  [TAGS.tests, TAGS.courses],
  { fallback: [] },
);

type RawCategory = Awaited<ReturnType<typeof rawCategories>>[number];

function toCard(row: RawCategory, locale: Locale): TestCategoryCardView {
  return {
    id: row.id,
    slug: row.slug,
    title: loc(row.title, locale),
    subtitle: locOrNull(row.subtitle, locale),
    imageUrl: row.imageUrl,
    icon: row.icon,
    questionCount: row._count.questions,
    timeLimitSec: row.timeLimitSec,
    requireContact: row.requireContact,
    allowBack: row.allowBack,
  };
}

export async function getTestCategories(locale: Locale): Promise<TestCategoryCardView[]> {
  const rows = await rawCategories();
  return rows.map((row) => toCard(row, locale));
}

export async function getTestRunner(slug: string, locale: Locale): Promise<TestRunnerView | null> {
  const categories = await rawCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return null;

  const questions = await rawQuestions(slug);

  return {
    ...toCard(category, locale),
    shuffle: category.shuffle,
    questionCount: questions.length,
    maxScore: questions.reduce((total, question) => total + question.points, 0),
    questions: questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      answerType: question.answerType,
      imageUrl: question.imageUrl,
      audioUrl: question.audioUrl,
      options: question.options,
    })),
  };
}

export async function getTestBands(slug: string, locale: Locale): Promise<TestBandView[]> {
  const rows = await rawBands(slug);
  return rows.map((row) => {
    const course: CourseCardView | null = row.course
      ? {
          id: row.course.id,
          slug: row.course.slug,
          title: loc(row.course.title, locale),
          shortDesc: loc(row.course.shortDesc, locale),
          level: locOrNull(row.course.level, locale),
          durationLabel: loc(row.course.durationLabel, locale),
          price: row.course.price ? Number(row.course.price) : null,
          priceNote: locOrNull(row.course.priceNote, locale),
          currency: row.course.currency,
          publisher: row.course.publisher,
          coverUrl: row.course.coverUrl,
          iconUrl: row.course.iconUrl,
          hasDetailPage: row.course.hasDetailPage,
          isFeatured: row.course.isFeatured,
        }
      : null;

    return {
      id: row.id,
      minScore: row.minScore,
      maxScore: row.maxScore,
      levelName: row.levelName,
      title: loc(row.title, locale),
      description: loc(row.description, locale),
      course,
    };
  });
}

/** Server-only: the answer key used to grade an attempt. */
export async function getAnswerKey(slug: string) {
  return prisma.testQuestion.findMany({
    where: { isActive: true, category: { slug, isPublished: true } },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      points: true,
      answerType: true,
      acceptedAnswers: true,
      options: { select: { id: true, isCorrect: true } },
    },
  });
}

export async function getTestCategorySlugs(): Promise<string[]> {
  const rows = await rawCategories();
  return rows.map((row) => row.slug);
}
