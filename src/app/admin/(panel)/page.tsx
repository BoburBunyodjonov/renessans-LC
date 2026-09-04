import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
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
export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('nav.dashboard') };
}

export default async function AdminDashboardPage() {
  const [t, { kpis, charts, latestLeads, latestApplications }] = await Promise.all([
    getTranslations('admin'),
    getDashboard(),
  ]);

  return (
    <>
      <PageHeader title={t('dashboard')} description={t('dash.description')} />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dash.leadsToday')}
          value={kpis.leadsToday}
          delta={kpis.leadsTodayDelta}
          hint={t('dash.vsYesterday')}
          icon={<Inbox className="size-5" aria-hidden />}
        />
        <StatCard
          label={t('dash.leadsWeek')}
          value={kpis.leadsWeek}
          delta={kpis.leadsWeekDelta}
          hint={t('dash.vsPrevWeek')}
          icon={<TrendingUp className="size-5" aria-hidden />}
        />
        <StatCard
          label={t('dash.leadsMonth')}
          value={kpis.leadsMonth}
          delta={kpis.leadsMonthDelta}
          hint={t('dash.vsPrevMonth')}
          icon={<Users className="size-5" aria-hidden />}
        />
        <StatCard
          label={t('dash.conversion')}
          value={`${kpis.conversion}%`}
          icon={<Percent className="size-5" aria-hidden />}
        />
        <StatCard
          label={t('dash.attempts')}
          value={kpis.attempts}
          icon={<ClipboardList className="size-5" aria-hidden />}
        />
        <StatCard
          label={t('dash.downloads')}
          value={kpis.downloads}
          icon={<Download className="size-5" aria-hidden />}
        />
        <StatCard
          label={t('dash.unread')}
          value={kpis.unreadMessages}
          icon={<Mail className="size-5" aria-hidden />}
        />
        <StatCard
          label={t('dash.openVacancies')}
          value={kpis.openVacancies}
          hint={t('dash.newApplications', { count: kpis.newApplications })}
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <LeadsPerDayChart data={charts.leadsPerDay} />
        <LeadsBySourceChart data={charts.leadsBySource} />
        <SimpleBarChart title={t('charts.byCourse')} data={charts.leadsByCourse} />
        <ScoreHistogram data={charts.scoreDistribution} />
        <SimpleBarChart
          title={t('charts.topMaterials')}
          data={charts.topMaterials}
          color="#B45309"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelTitle hint={t('dash.lastN', { count: 10 })}>
            <Link href="/admin/leads" className="hover:text-brand-600">
              {t('dash.latestLeads')}
            </Link>
          </PanelTitle>

          {latestLeads.length === 0 ? (
            <p className="py-6 text-center text-sm text-admin-muted">{t('dash.noLeads')}</p>
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
                    {t('dash.call')}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelTitle hint={t('dash.lastN', { count: 5 })}>
            <Link href="/admin/applications" className="hover:text-brand-600">
              {t('dash.latestApplications')}
            </Link>
          </PanelTitle>

          {latestApplications.length === 0 ? (
            <p className="py-6 text-center text-sm text-admin-muted">{t('dash.noLeads')}</p>
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
