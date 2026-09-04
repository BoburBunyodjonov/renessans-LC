import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/ui';
import { UsersManager } from '@/components/admin/users-manager';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('nav.users') };
}

export default async function UsersPage() {
  const actor = await currentUser();
  if (!can(actor?.role, 'manageUsers')) redirect('/admin');

  const t = await getTranslations('admin');
  const users = await prisma.user.findMany({
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true },
  });

  return (
    <>
      <PageHeader title={t('nav.users')} description={t('users.description')} />
      <UsersManager
        currentUserId={actor!.id}
        users={users.map((user) => ({
          ...user,
          lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
