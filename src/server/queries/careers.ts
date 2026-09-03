import { prisma } from '@/lib/prisma';
import { TAGS, cachedQuery } from '@/lib/cache';
import { isPreview } from '@/lib/draft';
import { loc, locList, locOrNull } from '@/lib/localize';
import type { Locale } from '@/types/i18n';
import type { HiringStepView, VacancyCardView, VacancyDetailView } from '@/types/content';

const vacancySelect = {
  id: true,
  slug: true,
  title: true,
  shortDesc: true,
  description: true,
  responsibilities: true,
  requirements: true,
  conditions: true,
  department: true,
  employmentType: true,
  salaryFrom: true,
  salaryTo: true,
  showSalary: true,
} as const;

function serialize<T extends { salaryFrom: unknown; salaryTo: unknown }>(row: T) {
  return {
    ...row,
    salaryFrom: row.salaryFrom ? Number(row.salaryFrom) : null,
    salaryTo: row.salaryTo ? Number(row.salaryTo) : null,
  };
}

const rawVacancies = cachedQuery(
  async () => {
    const rows = await prisma.vacancy.findMany({
      where: { isOpen: true },
      orderBy: { order: 'asc' },
      select: vacancySelect,
    });
    return rows.map(serialize);
  },
  ['vacancies:list'],
  [TAGS.vacancies],
  { fallback: [] },
);

async function fetchVacancyBySlug(slug: string, includeClosed = false) {
  const row = await prisma.vacancy.findFirst({
    where: { slug, ...(includeClosed ? {} : { isOpen: true }) },
    select: vacancySelect,
  });
  return row ? serialize(row) : null;
}

const rawVacancyBySlug = cachedQuery(
  (slug: string) => fetchVacancyBySlug(slug),
  ['vacancies:by-slug'],
  [TAGS.vacancies],
  { fallback: null },
);

const rawHiringSteps = cachedQuery(
  async () => prisma.hiringStep.findMany({ orderBy: { order: 'asc' } }),
  ['careers:hiring-steps'],
  [TAGS.vacancies],
  { fallback: [] },
);

type RawVacancy = Awaited<ReturnType<typeof rawVacancies>>[number];

function toCard(row: RawVacancy, locale: Locale): VacancyCardView {
  return {
    id: row.id,
    slug: row.slug,
    title: loc(row.title, locale),
    shortDesc: loc(row.shortDesc, locale),
    department: locOrNull(row.department, locale),
    employmentType: locOrNull(row.employmentType, locale),
    salaryFrom: row.salaryFrom,
    salaryTo: row.salaryTo,
    showSalary: row.showSalary,
  };
}

export async function getVacancies(locale: Locale): Promise<VacancyCardView[]> {
  const rows = await rawVacancies();
  return rows.map((row) => toCard(row, locale));
}

export async function getVacancyBySlug(
  slug: string,
  locale: Locale,
): Promise<VacancyDetailView | null> {
  const row = (await isPreview())
    ? await fetchVacancyBySlug(slug, true)
    : await rawVacancyBySlug(slug);
  if (!row) return null;

  return {
    ...toCard(row, locale),
    description: locOrNull(row.description, locale),
    responsibilities: locList(row.responsibilities, locale),
    requirements: locList(row.requirements, locale),
    conditions: locList(row.conditions, locale),
  };
}

export async function getHiringSteps(locale: Locale): Promise<HiringStepView[]> {
  const rows = await rawHiringSteps();
  return rows.map((row) => ({
    id: row.id,
    title: loc(row.title, locale),
    description: loc(row.description, locale),
  }));
}

export async function getVacancySlugs(): Promise<string[]> {
  const rows = await rawVacancies();
  return rows.map((row) => row.slug);
}
