import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Phone, Send } from 'lucide-react';
import { PageHeader, Panel, PanelTitle, StatusPill } from '@/components/admin/ui';
import { LeadDetailActions } from '@/components/admin/lead-detail-actions';
import { getLead, leadFilterOptions } from '@/server/admin/leads';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, LEAD_STATUS_TONE } from '@/config/lead-status';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t, lead, { staff }, user] = await Promise.all([
    getTranslations('admin'),
    getLead(id),
    leadFilterOptions(),
    currentUser(),
  ]);

  if (!lead) notFound();
  const canManage = can(user?.role, 'manageLeads');

  const facts: [string, string | null][] = [
    [t('leads.phone'), lead.phone],
    [t('leads.email'), lead.email],
    [t('leads.course'), lead.course?.title ?? null],
    [t('leads.source'), LEAD_SOURCE_LABELS[lead.source] ?? lead.source],
    [t('leads.page'), lead.page],
    [t('leads.locale'), lead.locale],
    [t('leads.preferredTime'), lead.preferredTime],
    [t('leads.message'), lead.message],
    ['UTM source', lead.utm.source],
    ['UTM medium', lead.utm.medium],
    ['UTM campaign', lead.utm.campaign],
    [t('leads.referrer'), lead.referrer],
    [t('leads.device'), lead.userAgent],
  ];

  return (
    <>
      <PageHeader
        title={lead.name}
        description={t('leads.createdAt', {
          date: new Date(lead.createdAt).toLocaleString('uz-UZ'),
        })}
        actions={
          <>
            <StatusPill tone={LEAD_STATUS_TONE[lead.status] ?? 'neutral'}>
              {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS]}
            </StatusPill>
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Phone className="size-4" aria-hidden />
              {t('dash.call')}
            </a>
            <a
              href={`https://t.me/+${lead.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-admin-border px-4 text-sm font-semibold text-admin-text hover:bg-admin-hover"
            >
              <Send className="size-4" aria-hidden />
              Telegram
            </a>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel>
          <PanelTitle>{t('leads.facts')}</PanelTitle>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {facts
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs font-bold tracking-wide text-admin-muted uppercase">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm break-words text-admin-text">{value}</dd>
                </div>
              ))}
          </dl>

          {lead.attempt ? (
            <div className="mt-5 rounded-md border border-admin-border p-4">
              <p className="text-xs font-bold tracking-wide text-admin-muted uppercase">
                {t('leads.testResult')}
              </p>
              <p className="mt-1 text-sm text-admin-text">
                {lead.attempt.score}/{lead.attempt.maxScore} · {lead.attempt.levelName ?? '—'}
              </p>
            </div>
          ) : null}
        </Panel>

        <LeadDetailActions
          leadId={lead.id}
          status={lead.status}
          assigneeId={lead.assignee?.id ?? null}
          staff={staff}
          notes={lead.notes}
          canManage={canManage}
          canPurge={can(user?.role, 'hardDelete')}
        />
      </div>
    </>
  );
}
