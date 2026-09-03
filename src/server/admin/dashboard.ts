import { prisma } from '@/lib/prisma';

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(days: number): Date {
  return startOfDay(new Date(Date.now() - days * 86_400_000));
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

const localizedUz = (value: unknown, fallback: string): string => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uz = (value as Record<string, unknown>).uz;
    if (typeof uz === 'string' && uz.trim()) return uz;
  }
  return fallback;
};

/** Everything the admin dashboard needs, in one round of queries. */
export async function getDashboard() {
  const today = startOfDay(new Date());
  const weekStart = daysAgo(7);
  const monthStart = daysAgo(30);
  const previousWeekStart = daysAgo(14);
  const previousMonthStart = daysAgo(60);
  const yesterday = daysAgo(1);

  const notDeleted = { deletedAt: null };

  const [
    leadsToday,
    leadsYesterday,
    leadsWeek,
    leadsPreviousWeek,
    leadsMonth,
    leadsPreviousMonth,
    totalLeads,
    enrolledLeads,
    attempts,
    downloads,
    unreadMessages,
    openVacancies,
    newApplications,
    leadsBySource,
    leadsByCourseRaw,
    latestLeads,
    latestApplications,
    leadsPerDayRaw,
    attemptScores,
    topMaterialsRaw,
  ] = await Promise.all([
    prisma.lead.count({ where: { ...notDeleted, createdAt: { gte: today } } }),
    prisma.lead.count({ where: { ...notDeleted, createdAt: { gte: yesterday, lt: today } } }),
    prisma.lead.count({ where: { ...notDeleted, createdAt: { gte: weekStart } } }),
    prisma.lead.count({
      where: { ...notDeleted, createdAt: { gte: previousWeekStart, lt: weekStart } },
    }),
    prisma.lead.count({ where: { ...notDeleted, createdAt: { gte: monthStart } } }),
    prisma.lead.count({
      where: { ...notDeleted, createdAt: { gte: previousMonthStart, lt: monthStart } },
    }),
    prisma.lead.count({ where: notDeleted }),
    prisma.lead.count({ where: { ...notDeleted, status: 'ENROLLED' } }),
    prisma.testAttempt.count(),
    prisma.materialDownload.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.vacancy.count({ where: { isOpen: true } }),
    prisma.jobApplication.count({ where: { deletedAt: null, status: 'NEW' } }),
    prisma.lead.groupBy({ by: ['source'], where: notDeleted, _count: { _all: true } }),
    prisma.lead.groupBy({
      by: ['courseId'],
      where: { ...notDeleted, courseId: { not: null } },
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      where: notDeleted,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { course: { select: { title: true } } },
    }),
    prisma.jobApplication.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { vacancy: { select: { title: true } } },
    }),
    prisma.lead.findMany({
      where: { ...notDeleted, createdAt: { gte: monthStart } },
      select: { createdAt: true },
    }),
    prisma.testAttempt.findMany({ select: { score: true, maxScore: true } }),
    prisma.material.findMany({
      where: { deletedAt: null },
      orderBy: { downloadCount: 'desc' },
      take: 5,
      select: { id: true, title: true, downloadCount: true },
    }),
  ]);

  const courses = await prisma.course.findMany({
    where: { id: { in: leadsByCourseRaw.map((row) => row.courseId!).filter(Boolean) } },
    select: { id: true, title: true },
  });
  const courseTitles = new Map(
    courses.map((course) => [course.id, localizedUz(course.title, course.id)]),
  );

  // Leads per day for the last 30 days, including empty days.
  const perDay = new Map<string, number>();
  for (let index = 29; index >= 0; index -= 1) {
    perDay.set(daysAgo(index).toISOString().slice(0, 10), 0);
  }
  for (const lead of leadsPerDayRaw) {
    const key = startOfDay(lead.createdAt).toISOString().slice(0, 10);
    if (perDay.has(key)) perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }

  // Score distribution in 10-percentage-point buckets.
  const buckets = Array.from({ length: 10 }, (_, index) => ({
    label: `${index * 10}–${index * 10 + 10}%`,
    count: 0,
  }));
  for (const attempt of attemptScores) {
    if (attempt.maxScore <= 0) continue;
    const percent = (attempt.score / attempt.maxScore) * 100;
    const index = Math.min(9, Math.floor(percent / 10));
    buckets[index]!.count += 1;
  }

  return {
    kpis: {
      leadsToday,
      leadsTodayDelta: percentChange(leadsToday, leadsYesterday),
      leadsWeek,
      leadsWeekDelta: percentChange(leadsWeek, leadsPreviousWeek),
      leadsMonth,
      leadsMonthDelta: percentChange(leadsMonth, leadsPreviousMonth),
      conversion: totalLeads > 0 ? Math.round((enrolledLeads / totalLeads) * 100) : 0,
      attempts,
      downloads,
      unreadMessages,
      openVacancies,
      newApplications,
    },
    charts: {
      leadsPerDay: [...perDay.entries()].map(([date, count]) => ({ date: date.slice(5), count })),
      leadsBySource: leadsBySource.map((row) => ({ name: row.source, value: row._count._all })),
      leadsByCourse: leadsByCourseRaw.map((row) => ({
        name: courseTitles.get(row.courseId!) ?? '—',
        value: row._count._all,
      })),
      scoreDistribution: buckets,
      topMaterials: topMaterialsRaw.map((row) => ({
        name: localizedUz(row.title, row.id),
        value: row.downloadCount,
      })),
    },
    latestLeads: latestLeads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      course: lead.course ? localizedUz(lead.course.title, '') : null,
      createdAt: lead.createdAt.toISOString(),
    })),
    latestApplications: latestApplications.map((application) => ({
      id: application.id,
      fullName: application.fullName,
      phone: application.phone,
      status: application.status,
      vacancy: application.vacancy ? localizedUz(application.vacancy.title, '') : null,
      createdAt: application.createdAt.toISOString(),
    })),
  };
}
