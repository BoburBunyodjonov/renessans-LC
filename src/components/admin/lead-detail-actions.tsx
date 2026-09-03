'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { Panel, PanelTitle } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Label, Textarea } from '@/components/ui/field';
import { describeError } from '@/components/admin/form-shell';
import { addLeadNote, assignLead, purgeLead, updateLeadStatus } from '@/server/actions/leads';
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/config/lead-status';

type Note = { id: string; body: string; author: string | null; createdAt: string };

export function LeadDetailActions({
  leadId,
  status,
  assigneeId,
  staff,
  notes,
  canManage,
  canPurge,
}: {
  leadId: string;
  status: string;
  assigneeId: string | null;
  staff: { value: string; label: string }[];
  notes: Note[];
  canManage: boolean;
  canPurge: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState('');

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(describeError(result.error ?? 'UNKNOWN_ERROR'));
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <PanelTitle>Holat va mas’ul</PanelTitle>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-admin-text">Holat</Label>
            <select
              value={status}
              disabled={!canManage || pending}
              onChange={(event) =>
                run(() => updateLeadStatus(leadId, event.target.value), 'Holat yangilandi')
              }
              className="h-11 rounded-md border border-admin-border bg-admin-panel px-3 text-sm text-admin-text"
            >
              {LEAD_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {LEAD_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-admin-text">Mas’ul xodim</Label>
            <select
              value={assigneeId ?? ''}
              disabled={!canManage || pending}
              onChange={(event) =>
                run(() => assignLead(leadId, event.target.value || null), 'Mas’ul yangilandi')
              }
              className="h-11 rounded-md border border-admin-border bg-admin-panel px-3 text-sm text-admin-text"
            >
              <option value="">— biriktirilmagan —</option>
              {staff.map((member) => (
                <option key={member.value} value={member.value}>
                  {member.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle hint="Qo‘ng‘iroq natijasi, kelishuvlar va h.k.">Izohlar</PanelTitle>

        {canManage ? (
          <div className="mb-4 flex flex-col gap-2">
            <Textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Izoh yozing..."
              className="border-admin-border bg-admin-panel text-admin-text"
            />
            <Button
              size="sm"
              disabled={pending || !note.trim()}
              onClick={() =>
                run(async () => {
                  const result = await addLeadNote(leadId, note);
                  if (result.ok) setNote('');
                  return result;
                }, 'Izoh qo‘shildi')
              }
              className="self-start"
            >
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              Qo‘shish
            </Button>
          </div>
        ) : null}

        {notes.length === 0 ? (
          <p className="text-sm text-admin-muted">Hozircha izoh yo‘q</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((item) => (
              <li key={item.id} className="rounded-md border border-admin-border p-3">
                <p className="text-sm whitespace-pre-line text-admin-text">{item.body}</p>
                <p className="mt-1.5 text-xs text-admin-muted">
                  {item.author ?? 'Tizim'} · {new Date(item.createdAt).toLocaleString('uz-UZ')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {canPurge ? (
        <Panel>
          <PanelTitle hint="Shaxsiy ma’lumotni o‘chirish so‘rovlari uchun. Qaytarib bo‘lmaydi.">
            Butunlay o‘chirish
          </PanelTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-danger/10"
            disabled={pending}
            onClick={() => {
              if (!window.confirm('Ariza butunlay o‘chirilsinmi? Bu amalni qaytarib bo‘lmaydi.'))
                return;
              startTransition(async () => {
                const result = await purgeLead(leadId);
                if (result.ok) {
                  toast.success('O‘chirildi');
                  router.push('/admin/leads');
                } else {
                  toast.error(describeError(result.error ?? 'UNKNOWN_ERROR'));
                }
              });
            }}
          >
            <Trash2 aria-hidden />
            Butunlay o‘chirish
          </Button>
        </Panel>
      ) : null}
    </div>
  );
}
