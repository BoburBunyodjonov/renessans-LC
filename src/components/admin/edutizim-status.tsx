'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { resendAttemptToEdutizim } from '@/server/actions/tests';

/**
 * Whether one attempt reached EduTizim, and a way to try again if it did not.
 *
 * A failure here is never silent: the attempt is stored regardless, and this is
 * how somebody notices it never left the building. The reason is shown as it
 * came back, because "HTTP 400: surveyId must be a mongodb id" is the sentence
 * that tells the school what to fix in their settings.
 */
export function EdutizimStatus({
  attemptId,
  orderId,
  sentAt,
  error,
}: {
  attemptId: string;
  orderId: string | null;
  sentAt: string | null;
  error: string | null;
}) {
  const t = useTranslations('admin');
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<{ orderId: string | null; error: string | null }>({
    orderId,
    error,
  });

  if (state.orderId) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
        ✓ {t('attempts.edutizimSent')}
        {sentAt ? (
          <span className="font-normal text-admin-muted">
            {new Date(sentAt).toLocaleDateString('uz-UZ')}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="flex flex-col items-start gap-1">
      {state.error ? (
        <span className="text-xs text-danger dark:text-admin-danger" title={state.error}>
          {state.error.slice(0, 40)}
          {state.error.length > 40 ? '…' : ''}
        </span>
      ) : (
        <span className="text-xs text-admin-muted">—</span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await resendAttemptToEdutizim(attemptId);
            if (!result.ok || !result.data) {
              toast.error(t('errors.unknown'));
              return;
            }

            const { orderId: sentId, error: sendError } = result.data;
            setState({ orderId: sentId, error: sendError });
            if (sentId) toast.success(t('common.saved'));
            else toast.error(sendError ?? t('errors.unknown'));
          })
        }
        className="text-xs font-bold text-brand-600 disabled:opacity-50 dark:text-admin-accent"
      >
        {pending ? '…' : t('attempts.edutizimResend')}
      </button>
    </span>
  );
}
