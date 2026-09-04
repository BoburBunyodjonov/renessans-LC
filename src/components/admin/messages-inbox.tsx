'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Mail, MailOpen, Phone } from 'lucide-react';
import { EmptyState, Panel, StatusPill } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { describeError } from '@/components/admin/form-shell';
import { markMessageRead } from '@/server/actions/leads';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function MessagesInbox({
  rows,
  unreadOnly,
  canManage,
}: {
  rows: Message[];
  unreadOnly: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const t = useTranslations('admin');
  const [pending, startTransition] = useTransition();

  function toggle(message: Message) {
    startTransition(async () => {
      const result = await markMessageRead(message.id, !message.isRead);
      if (result.ok) router.refresh();
      else toast.error(describeError(result.error, t));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button
          variant={unreadOnly ? 'ghost' : 'brand'}
          size="sm"
          onClick={() => router.replace('?')}
        >
          {t('common.all')}
        </Button>
        <Button
          variant={unreadOnly ? 'brand' : 'ghost'}
          size="sm"
          onClick={() => router.replace('?unread=1')}
        >
          {t('msgs.unreadOnly')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={t('msgs.empty')} description={t('msgs.emptyHint')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((message) => (
            <li key={message.id}>
              <Panel className={cn('p-4 md:p-5', !message.isRead && 'border-brand-600/40')}>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-admin-text">{message.name}</p>
                  {!message.isRead ? <StatusPill tone="brand">{t('msgs.new')}</StatusPill> : null}
                  <span className="ms-auto text-xs text-admin-muted tabular-nums">
                    {new Date(message.createdAt).toLocaleString('uz-UZ')}
                  </span>
                </div>

                {message.subject ? (
                  <p className="mt-2 text-sm font-semibold text-admin-text">{message.subject}</p>
                ) : null}
                <p className="mt-2 text-sm whitespace-pre-line text-admin-text">
                  {message.message}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  {message.phone ? (
                    <a
                      href={`tel:${message.phone}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700 dark:text-admin-accent dark:hover:text-admin-accent"
                    >
                      <Phone className="size-4" aria-hidden />
                      {message.phone}
                    </a>
                  ) : null}
                  {message.email ? (
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(message.subject ?? 'Renessans English School')}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700 dark:text-admin-accent dark:hover:text-admin-accent"
                    >
                      <Mail className="size-4" aria-hidden />
                      {message.email}
                    </a>
                  ) : null}

                  {canManage ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => toggle(message)}
                      className="ms-auto text-admin-muted hover:bg-admin-hover hover:text-admin-text"
                    >
                      <MailOpen aria-hidden />
                      {message.isRead ? t('msgs.markUnread') : t('msgs.markRead')}
                    </Button>
                  ) : null}
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
