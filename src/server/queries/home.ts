import { prisma } from '@/lib/prisma';
import { TAGS, cachedQuery } from '@/lib/cache';
import { loc, locOrNull } from '@/lib/localize';
import { asLocalized, t, type Locale } from '@/types/i18n';
import type {
  AdvantageView,
  BranchView,
  FaqGroupView,
  HeroSlideView,
  HomeSectionView,
  MaterialCounts,
  ProblemView,
  PromotionPrizeView,
  PromotionView,
  SkillKey,
  StatView,
  TestimonialView,
} from '@/types/content';

const rawHomeSections = cachedQuery(
  async () => prisma.homeSection.findMany({ orderBy: { order: 'asc' } }),
  ['home:sections'],
  [TAGS.home],
  { fallback: [] },
);

const rawHeroSlides = cachedQuery(
  async () =>
    prisma.heroSlide.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
  ['home:hero'],
  [TAGS.home],
  { fallback: [] },
);

const rawStats = cachedQuery(
  async () => prisma.stat.findMany({ where: { isVisible: true }, orderBy: { order: 'asc' } }),
  ['home:stats'],
  [TAGS.home],
  { fallback: [] },
);

const rawAdvantages = cachedQuery(
  async () =>
    prisma.advantage.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } }),
  ['home:advantages'],
  [TAGS.home],
  { fallback: [] },
);

const rawProblems = cachedQuery(
  async () =>
    prisma.problem.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: { solution: true },
    }),
  ['home:problems'],
  [TAGS.home],
  { fallback: [] },
);

const rawTestimonials = cachedQuery(
  async () =>
    prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
    }),
  ['home:testimonials'],
  [TAGS.testimonials],
  { fallback: [] },
);

const rawFaq = cachedQuery(
  async () =>
    prisma.faqCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: { where: { isPublished: true }, orderBy: { order: 'asc' } },
      },
    }),
  ['home:faq'],
  [TAGS.faq],
  { fallback: [] },
);

const rawUncategorisedFaq = cachedQuery(
  async () =>
    prisma.faq.findMany({
      where: { isPublished: true, categoryId: null },
      orderBy: { order: 'asc' },
    }),
  ['home:faq-uncategorised'],
  [TAGS.faq],
  { fallback: [] },
);

const rawBranches = cachedQuery(
  async () => prisma.branch.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
  ['home:branches'],
  [TAGS.branches],
  { fallback: [] },
);

/**
 * Promotions are time-boxed, so this query is not cached across the ISR window —
 * an expired campaign must disappear on the next request, not five minutes later.
 */
async function findActivePromotion() {
  const now = new Date();
  try {
    return await prisma.promotion.findFirst({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { order: 'asc' },
    });
  } catch (error) {
    // Same contract as the cached queries: a database outage hides the section
    // rather than taking the page down.
    console.error('[query:home:promotion] failed, hiding the section', error);
    return null;
  }
}

const rawMaterialCounts = cachedQuery(
  async () => {
    const grouped = await prisma.material.groupBy({
      by: ['type'],
      where: { isPublished: true, deletedAt: null },
      _count: { _all: true },
    });
    return grouped.map((row) => ({ type: row.type, count: row._count._all }));
  },
  ['home:material-counts'],
  [TAGS.materials],
  { fallback: [] },
);

export async function getHomeSections(locale: Locale): Promise<HomeSectionView[]> {
  const rows = await rawHomeSections();
  return rows.map((row) => ({
    key: row.key,
    order: row.order,
    isVisible: row.isVisible,
    eyebrow: locOrNull(row.eyebrow, locale),
    title: locOrNull(row.title, locale),
    subtitle: locOrNull(row.subtitle, locale),
    body: locOrNull(row.body, locale),
    imageUrl: row.imageUrl,
    videoUrl: row.videoUrl,
    ctaLabel: locOrNull(row.ctaLabel, locale),
    ctaHref: row.ctaHref,
  }));
}

export async function getHeroSlides(locale: Locale): Promise<HeroSlideView[]> {
  const rows = await rawHeroSlides();
  return rows.map((row) => ({
    id: row.id,
    headline: loc(row.headline, locale),
    subtitle: locOrNull(row.subtitle, locale),
    ctaLabel: locOrNull(row.ctaLabel, locale),
    ctaHref: row.ctaHref,
    imageUrl: row.imageUrl,
    imageAlt: locOrNull(row.imageAlt, locale),
    videoUrl: row.videoUrl,
  }));
}

export async function getStats(locale: Locale): Promise<StatView[]> {
  const rows = await rawStats();
  return rows.map((row) => ({
    id: row.id,
    value: row.value,
    label: loc(row.label, locale),
    icon: row.icon,
  }));
}

export async function getAdvantages(locale: Locale): Promise<AdvantageView[]> {
  const rows = await rawAdvantages();
  return rows.map((row) => ({
    id: row.id,
    title: loc(row.title, locale),
    description: loc(row.description, locale),
    icon: row.icon,
    imageUrl: row.imageUrl,
  }));
}

export async function getProblems(locale: Locale): Promise<ProblemView[]> {
  const rows = await rawProblems();
  return rows.map((row) => ({
    id: row.id,
    title: loc(row.title, locale),
    description: loc(row.description, locale),
    icon: row.icon,
    solution: row.solution
      ? {
          id: row.solution.id,
          skill: row.solution.skill as SkillKey,
          title: loc(row.solution.title, locale),
          description: loc(row.solution.description, locale),
          imageUrl: row.solution.imageUrl,
        }
      : null,
  }));
}

export async function getTestimonials(locale: Locale): Promise<TestimonialView[]> {
  const rows = await rawTestimonials();
  return rows.map((row) => ({
    id: row.id,
    authorName: row.authorName,
    authorRole: locOrNull(row.authorRole, locale),
    avatarUrl: row.avatarUrl,
    content: loc(row.content, locale),
    rating: row.rating,
    videoUrl: row.videoUrl,
    sourceLabel: row.sourceLabel,
    sourceUrl: row.sourceUrl,
    isFeatured: row.isFeatured,
  }));
}

export async function getFaqGroups(locale: Locale): Promise<FaqGroupView[]> {
  const [categories, loose] = await Promise.all([rawFaq(), rawUncategorisedFaq()]);

  const groups: FaqGroupView[] = categories
    .map((category) => ({
      id: category.id,
      name: loc(category.name, locale),
      items: category.items.map((item) => ({
        id: item.id,
        question: loc(item.question, locale),
        answer: loc(item.answer, locale),
      })),
    }))
    .filter((group) => group.items.length > 0);

  if (loose.length > 0) {
    groups.push({
      id: 'uncategorised',
      name: '',
      items: loose.map((item) => ({
        id: item.id,
        question: loc(item.question, locale),
        answer: loc(item.answer, locale),
      })),
    });
  }

  return groups;
}

export async function getActivePromotion(locale: Locale): Promise<PromotionView | null> {
  const row = await findActivePromotion();
  if (!row) return null;

  const prizes: PromotionPrizeView[] = Array.isArray(row.prizes)
    ? row.prizes
        .map((prize, index) => {
          if (!prize || typeof prize !== 'object') return null;
          const record = prize as Record<string, unknown>;
          const label = t(asLocalized(record.label), locale);
          if (!label) return null;
          return {
            place: typeof record.place === 'number' ? record.place : index + 1,
            label,
            icon: typeof record.icon === 'string' ? record.icon : null,
          };
        })
        .filter((prize): prize is PromotionPrizeView => prize !== null)
    : [];

  return {
    id: row.id,
    title: loc(row.title, locale),
    description: loc(row.description, locale),
    prizes,
    imageUrl: row.imageUrl,
    ctaLabel: locOrNull(row.ctaLabel, locale),
    ctaHref: row.ctaHref,
    endsAt: row.endsAt.toISOString(),
  };
}

export async function getBranches(locale: Locale): Promise<BranchView[]> {
  const rows = await rawBranches();
  return rows.map((row) => ({
    id: row.id,
    name: loc(row.name, locale),
    address: loc(row.address, locale),
    phones: row.phones,
    workingHours: locOrNull(row.workingHours, locale),
    mapEmbedUrl: row.mapEmbedUrl,
    mapLinkUrl: row.mapLinkUrl,
    imageUrl: row.imageUrl,
  }));
}

export async function getMaterialCounts(): Promise<MaterialCounts> {
  const rows = await rawMaterialCounts();
  const counts: MaterialCounts = { PDF: 0, AUDIO: 0, VIDEO: 0, PHOTO: 0 };
  for (const row of rows) counts[row.type] = row.count;
  return counts;
}
