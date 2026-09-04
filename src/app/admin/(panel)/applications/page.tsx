import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/ui';
import { ApplicationsTable } from '@/components/admin/applications-table';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('nav.applications') };
}

const localizedUz = (value: unknown): string | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uz = (value as Record<string, unknown>).uz;
    if (typeof uz === 'string') return uz;
  }
  return null;
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const page = Number(query.page ?? 1) || 1;
  const pageSize = 25;

  const where = {
    deletedAt: null,
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.vacancyId ? { vacancyId: query.vacancyId } : {}),
    ...(query.q
      ? {
          OR: [
            { fullName: { contains: query.q, mode: 'insensitive' as const } },
            { phone: { contains: query.q } },
          ],
        }
      : {}),
  };

  const [t, rows, total, vacancies, user] = await Promise.all([
    getTranslations('admin'),
    prisma.jobApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { vacancy: { select: { title: true } } },
    }),
    prisma.jobApplication.count({ where }),
    prisma.vacancy.findMany({ select: { id: true, title: true }, orderBy: { order: 'asc' } }),
    currentUser(),
  ]);

  return (
    <>
      <PageHeader
        title={t('nav.applications')}
        description={t('apps.description', { count: total })}
      />
      <ApplicationsTable
        rows={rows.map((row) => ({
          id: row.id,
          fullName: row.fullName,
          phone: row.phone,
          email: row.email,
          status: row.status,
          vacancy: row.vacancy ? localizedUz(row.vacancy.title) : null,
          cvUrl: row.cvUrl,
          cvName: row.cvName,
          about: row.about,
          note: row.note,
          createdAt: row.createdAt.toISOString(),
        }))}
        total={total}
        page={page}
        pageSize={pageSize}
        vacancies={vacancies.map((vacancy) => ({
          value: vacancy.id,
          label: localizedUz(vacancy.title) ?? vacancy.id,
        }))}
        canManage={can(user?.role, 'manageLeads')}
        canExport={can(user?.role, 'exportCsv')}
      />
    </>
  );
}
