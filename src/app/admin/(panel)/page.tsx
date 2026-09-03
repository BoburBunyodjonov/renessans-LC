import Link from 'next/link';
import { ClipboardList, Download, Inbox, Mail, Percent, TrendingUp, Users } from 'lucide-react';
import { PageHeader, Panel, PanelTitle, StatCard, StatusPill } from '@/components/admin/ui';
import {
  LeadsBySourceChart,
  LeadsPerDayChart,
  ScoreHistogram,
  SimpleBarChart,
} from '@/components/admin/dashboard-charts';
import { getDashboard } from '@/server/admin/dashboard';
import { LEAD_STATUS_TONE } from '@/config/lead-status';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Boshqaruv paneli' };

export default async function AdminDashboardPage() {
  const { kpis, charts, latestLeads, latestApplications } = await getDashboard();

  return (
    <>
      <PageHeader title="Boshqaruv paneli" description="Bugungi holat va oxirgi murojaatlar" />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bugungi arizalar"
          value={kpis.leadsToday}
          delta={kpis.leadsTodayDelta}
          hint="kechagiga nisbatan"
          icon={<Inbox className="size-5" aria-hidden />}
        />
        <StatCard
          label="7 kunlik arizalar"
          value={kpis.leadsWeek}
          delta={kpis.leadsWeekDelta}
          hint="oldingi haftaga nisbatan"
          icon={<TrendingUp className="size-5" aria-hidden />}
        />
        <StatCard
          label="30 kunlik arizalar"
          value={kpis.leadsMonth}
          delta={kpis.leadsMonthDelta}
          hint="oldingi oyga nisbatan"
          icon={<Users className="size-5" aria-hidden />}
        />
        <StatCard
          label="Konversiya (o‘qishga yozildi)"
          value={`${kpis.conversion}%`}
          icon={<Percent className="size-5" aria-hidden />}
        />
        <StatCard
          label="Test topshirganlar"
          value={kpis.attempts}
          icon={<ClipboardList className="size-5" aria-hidden />}
        />
        <StatCard
          label="Material yuklashlar"
          value={kpis.downloads}
          icon={<Download className="size-5" aria-hidden />}
        />
        <StatCard
          label="O‘qilmagan xabarlar"
          value={kpis.unreadMessages}
          icon={<Mail className="size-5" aria-hidden />}
        />
        <StatCard
          label="Ochiq vakansiyalar"
          value={kpis.openVacancies}
          hint={`${kpis.newApplications} ta yangi ariza`}
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <LeadsPerDayChart data={charts.leadsPerDay} />
        <LeadsBySourceChart data={charts.leadsBySource} />
        <SimpleBarChart title="Kurslar bo‘yicha arizalar" data={charts.leadsByCourse} />
        <ScoreHistogram data={charts.scoreDistribution} />
        <SimpleBarChart
          title="Eng ko‘p yuklangan materiallar"
          data={charts.topMaterials}
          color="#B45309"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle hint="Oxirgi 10 ta">
            <Link href="/admin/leads" className="hover:text-brand-600">
              Yangi arizalar
            </Link>
          </PanelTitle>

          {latestLeads.length === 0 ? (
            <p className="py-6 text-center text-sm text-admin-muted">Hozircha ariza yo‘q</p>
          ) : (
            <ul className="flex flex-col">
              {latestLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center gap-3 border-b border-admin-border py-2.5 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="block truncate text-sm font-semibold text-admin-text hover:text-brand-600"
                    >
                      {lead.name}
                    </Link>
                    <p className="truncate text-xs text-admin-muted">
                      {lead.phone}
                      {lead.course ? ` · ${lead.course}` : ''}
                    </p>
                  </div>
                  <StatusPill tone={LEAD_STATUS_TONE[lead.status] ?? 'neutral'}>
                    {lead.status}
                  </StatusPill>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Qo‘ng‘iroq
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelTitle hint="Oxirgi 5 ta">
            <Link href="/admin/applications" className="hover:text-brand-600">
              Vakansiya arizalari
            </Link>
          </PanelTitle>

          {latestApplications.length === 0 ? (
            <p className="py-6 text-center text-sm text-admin-muted">Hozircha ariza yo‘q</p>
          ) : (
            <ul className="flex flex-col">
              {latestApplications.map((application) => (
                <li
                  key={application.id}
                  className="flex items-center gap-3 border-b border-admin-border py-2.5 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-admin-text">
                      {application.fullName}
                    </p>
                    <p className="truncate text-xs text-admin-muted">
                      {application.phone}
                      {application.vacancy ? ` · ${application.vacancy}` : ''}
                    </p>
                  </div>
                  <StatusPill tone={application.status === 'NEW' ? 'brand' : 'neutral'}>
                    {application.status}
                  </StatusPill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
