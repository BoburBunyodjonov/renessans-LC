import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type LeadFilters = {
  q?: string;
  status?: string;
  source?: string;
  courseId?: string;
  assigneeId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  dir?: 'asc' | 'desc';
};

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  status: string;
  source: string;
  course: string | null;
  assignee: string | null;
  locale: string;
  utmSource: string | null;
  page: string | null;
  createdAt: string;
};

const localizedUz = (value: unknown): string | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uz = (value as Record<string, unknown>).uz;
    if (typeof uz === 'string' && uz.trim()) return uz;
  }
  return null;
};

export function buildLeadWhere(filters: LeadFilters): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = { deletedAt: null };

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { message: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (filters.status) where.status = filters.status as Prisma.EnumLeadStatusFilter['equals'];
  if (filters.source) where.source = filters.source as Prisma.EnumLeadSourceFilter['equals'];
  if (filters.courseId) where.courseId = filters.courseId;
  if (filters.assigneeId) where.assignedToId = filters.assigneeId;

  if (filters.from || filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59`) } : {}),
    };
  }

  return where;
}

export async function listLeads(filters: LeadFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, filters.pageSize ?? 25);
  const sort = filters.sort ?? 'createdAt';
  const dir = filters.dir ?? 'desc';
  const where = buildLeadWhere(filters);

  const [rows, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        course: { select: { title: true } },
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  const mapped: LeadRow[] = rows.map((lead) => ({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    status: lead.status,
    source: lead.source,
    course: lead.course ? localizedUz(lead.course.title) : null,
    assignee: lead.assignedTo?.name ?? null,
    locale: lead.locale,
    utmSource: lead.utmSource,
    page: lead.page,
    createdAt: lead.createdAt.toISOString(),
  }));

  return { rows: mapped, total, page, pageSize, sort: { id: sort, desc: dir === 'desc' } };
}

export async function getLead(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true } },
      assignedTo: { select: { id: true, name: true } },
      notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } },
      attempt: { select: { id: true, score: true, maxScore: true, levelName: true } },
    },
  });
  if (!lead) return null;

  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    message: lead.message,
    preferredTime: lead.preferredTime,
    status: lead.status,
    source: lead.source,
    locale: lead.locale,
    page: lead.page,
    referrer: lead.referrer,
    userAgent: lead.userAgent,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    course: lead.course ? { id: lead.course.id, title: localizedUz(lead.course.title) } : null,
    assignee: lead.assignedTo,
    utm: {
      source: lead.utmSource,
      medium: lead.utmMedium,
      campaign: lead.utmCampaign,
      content: lead.utmContent,
      term: lead.utmTerm,
    },
    attempt: lead.attempt,
    notes: lead.notes.map((note) => ({
      id: note.id,
      body: note.body,
      author: note.author?.name ?? null,
      createdAt: note.createdAt.toISOString(),
    })),
  };
}

export async function leadFilterOptions() {
  const [courses, staff] = await Promise.all([
    prisma.course.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true },
      orderBy: { order: 'asc' },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    courses: courses.map((course) => ({
      value: course.id,
      label: localizedUz(course.title) ?? course.id,
    })),
    staff: staff.map((user) => ({ value: user.id, label: user.name })),
  };
}

/** Rows for the CSV export — deliberately unpaginated but capped. */
export async function leadsForExport(filters: LeadFilters) {
  const rows = await prisma.lead.findMany({
    where: buildLeadWhere(filters),
    orderBy: { createdAt: 'desc' },
    take: 5000,
    include: { course: { select: { title: true } }, assignedTo: { select: { name: true } } },
  });

  return rows.map((lead) => ({
    id: lead.id,
    createdAt: lead.createdAt.toISOString(),
    name: lead.name,
    phone: lead.phone,
    email: lead.email ?? '',
    status: lead.status,
    source: lead.source,
    course: lead.course ? (localizedUz(lead.course.title) ?? '') : '',
    assignee: lead.assignedTo?.name ?? '',
    locale: lead.locale,
    page: lead.page ?? '',
    utmSource: lead.utmSource ?? '',
    utmMedium: lead.utmMedium ?? '',
    utmCampaign: lead.utmCampaign ?? '',
    message: lead.message ?? '',
  }));
}
