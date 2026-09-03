import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Maps a resource key to the Prisma model it drives. Each delegate is wrapped in
 * a narrow interface so the generic CRUD layer stays type-safe without `any`.
 */
export type RecordData = Record<string, unknown>;

export type Delegate = {
  findMany: (args: {
    where?: RecordData;
    orderBy?: RecordData | RecordData[];
    skip?: number;
    take?: number;
    include?: RecordData;
  }) => Promise<RecordData[]>;
  count: (args: { where?: RecordData }) => Promise<number>;
  findUnique: (args: { where: { id: string }; include?: RecordData }) => Promise<RecordData | null>;
  create: (args: { data: RecordData }) => Promise<{ id: string }>;
  update: (args: { where: { id: string }; data: RecordData }) => Promise<{ id: string }>;
  delete: (args: { where: { id: string } }) => Promise<{ id: string }>;
};

export type ResourceDelegate = {
  model: Delegate;
  /** Soft-deletable models set `deletedAt` instead of deleting the row. */
  softDelete?: boolean;
  include?: RecordData;
  /** 1:1 relations written through a nested upsert. */
  nested?: string[];
};

/** Prisma's per-model types differ; the cast is contained to this file. */
const asDelegate = (model: unknown): Delegate => model as Delegate;

export const DELEGATES: Record<string, ResourceDelegate> = {
  hero: { model: asDelegate(prisma.heroSlide) },
  'home-sections': { model: asDelegate(prisma.homeSection) },
  stats: { model: asDelegate(prisma.stat) },
  advantages: { model: asDelegate(prisma.advantage) },
  testimonials: { model: asDelegate(prisma.testimonial) },
  'success-stories': { model: asDelegate(prisma.successStory) },
  promotions: { model: asDelegate(prisma.promotion) },
  faq: { model: asDelegate(prisma.faq) },
  'faq-categories': { model: asDelegate(prisma.faqCategory) },
  branches: { model: asDelegate(prisma.branch) },
  navigation: { model: asDelegate(prisma.navItem) },
  'material-groups': { model: asDelegate(prisma.materialGroup) },
  materials: { model: asDelegate(prisma.material), softDelete: true },
  vacancies: { model: asDelegate(prisma.vacancy) },
  'hiring-steps': { model: asDelegate(prisma.hiringStep) },
  posts: { model: asDelegate(prisma.post) },
  courses: {
    model: asDelegate(prisma.course),
    softDelete: true,
    include: { teachers: { select: { id: true } } },
  },
  teachers: {
    model: asDelegate(prisma.teacher),
    include: { courses: { select: { id: true } } },
  },
  problems: {
    model: asDelegate(prisma.problem),
    include: { solution: true },
    nested: ['solution'],
  },
};

export function getDelegate(resourceKey: string): ResourceDelegate | null {
  return DELEGATES[resourceKey] ?? null;
}

/** Decimal columns need `Prisma.Decimal`, not a raw number. */
export function toDecimal(value: unknown): Prisma.Decimal | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? new Prisma.Decimal(numeric) : null;
}
