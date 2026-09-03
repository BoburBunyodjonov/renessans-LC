import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/ui';
import { MessagesInbox } from '@/components/admin/messages-inbox';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Xabarlar' };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const unreadOnly = query.unread === '1';

  const [rows, unread, user] = await Promise.all([
    prisma.contactMessage.findMany({
      where: unreadOnly ? { isRead: false } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    currentUser(),
  ]);

  return (
    <>
      <PageHeader title="Xabarlar" description={`${unread} ta o‘qilmagan xabar`} />
      <MessagesInbox
        rows={rows.map((row) => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          subject: row.subject,
          message: row.message,
          isRead: row.isRead,
          createdAt: row.createdAt.toISOString(),
        }))}
        unreadOnly={unreadOnly}
        canManage={can(user?.role, 'manageLeads')}
      />
    </>
  );
}
