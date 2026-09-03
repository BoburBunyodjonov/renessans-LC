'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, Loader2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnsavedGuard } from '@/hooks/use-unsaved-guard';
import type { ActionResult } from '@/server/actions/helpers';

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: 'Sessiya tugagan — qaytadan kiring',
  FORBIDDEN: 'Bu amal uchun ruxsat yo‘q',
  VALIDATION_ERROR: 'Maydonlarni tekshiring',
  UNKNOWN_ERROR: 'Saqlab bo‘lmadi',
};

export function describeError(code: string): string {
  return ERROR_MESSAGES[code] ?? code;
}

/**
 * Sticky action bar shared by every admin form: save, optional delete, optional
 * live preview, plus the unsaved-changes guard.
 */
export function AdminFormShell({
  dirty,
  onSave,
  onDelete,
  previewHref,
  backHref,
  children,
  saveLabel = 'Saqlash',
  extraActions,
}: {
  dirty: boolean;
  onSave: () => Promise<ActionResult<unknown>>;
  onDelete?: () => Promise<ActionResult<unknown>>;
  previewHref?: string;
  backHref?: string;
  children: ReactNode;
  saveLabel?: string;
  extraActions?: ReactNode;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useUnsavedGuard(dirty && !saving);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await onSave();
      if (result.ok) {
        toast.success('Saqlandi');
        router.refresh();
      } else {
        toast.error(describeError(result.error));
      }
      return result;
    } catch (error) {
      toast.error('Saqlab bo‘lmadi');
      console.error(error);
      return { ok: false as const, error: 'UNKNOWN_ERROR' };
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!window.confirm('O‘chirilsinmi?')) return;

    setDeleting(true);
    try {
      const result = await onDelete();
      if (result.ok) {
        toast.success('O‘chirildi');
        if (backHref) router.push(backHref);
        else router.refresh();
      } else {
        toast.error(describeError(result.error));
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-24">
      {children}

      <div className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center gap-2 border-t border-admin-border bg-admin-panel/95 px-4 py-3 backdrop-blur-sm md:px-6 lg:ps-[17rem]">
        {backHref ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(backHref)}
            className="text-admin-muted hover:bg-admin-hover hover:text-admin-text"
          >
            <ArrowLeft aria-hidden />
            Orqaga
          </Button>
        ) : null}

        {dirty ? (
          <span className="text-sm font-semibold text-warning">Saqlanmagan o‘zgarishlar</span>
        ) : null}

        <div className="ms-auto flex flex-wrap items-center gap-2">
          {extraActions}

          {previewHref ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
            >
              {/* Through Draft Mode, so unpublished edits are visible. */}
              <a
                href={`/api/draft?path=${encodeURIComponent(previewHref)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink aria-hidden />
                Ko‘rish
              </a>
            </Button>
          ) : null}

          {onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-danger hover:bg-danger/10"
            >
              {deleting ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
              O‘chirish
            </Button>
          ) : null}

          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
