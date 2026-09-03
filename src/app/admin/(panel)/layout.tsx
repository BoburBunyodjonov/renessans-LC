import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/topbar';
import { currentUser } from '@/server/actions/helpers';

export const dynamic = 'force-dynamic';

/** Authenticated shell. `/admin/login` sits outside this group. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/admin/login');

  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AdminShell>
  );
}
