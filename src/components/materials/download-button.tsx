'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeadModal } from '@/components/shared/lead-modal';
import { track } from '@/lib/analytics';
import { MATERIAL_CONSENT_COOKIE, MATERIAL_CONSENT_DAYS } from '@/lib/constants';
import type { MaterialView } from '@/types/content';

function hasConsent(): boolean {
  return document.cookie
    .split('; ')
    .some((entry) => entry.startsWith(`${MATERIAL_CONSENT_COOKIE}=`));
}

function grantConsent(): void {
  const maxAge = MATERIAL_CONSENT_DAYS * 24 * 60 * 60;
  document.cookie = `${MATERIAL_CONSENT_COOKIE}=1; path=/; max-age=${maxAge}; samesite=lax`;
}

/**
 * Gated materials open the lead modal first; consent is remembered in a cookie
 * for 30 days and is also enforced by the download route (PROMPT.md §9).
 */
export function DownloadButton({
  material,
  children,
}: {
  material: MaterialView;
  children: ReactNode;
}) {
  const t = useTranslations('materials');
  const { open } = useLeadModal();
  const [pending, setPending] = useState(false);

  const startDownload = useCallback(() => {
    setPending(true);
    track('material_downloaded', { material_id: material.id, type: material.type });
    window.location.href = `/api/materials/${material.id}/download`;
    window.setTimeout(() => setPending(false), 3000);
  }, [material.id, material.type]);

  const onClick = useCallback(() => {
    if (material.requireContact && !hasConsent()) {
      open({
        source: 'MATERIAL_GATE',
        title: t('gateTitle'),
        description: t('gateText'),
        onSuccess: () => {
          grantConsent();
          startDownload();
        },
      });
      return;
    }
    startDownload();
  }, [material.requireContact, open, startDownload, t]);

  return (
    <Button variant="dark" size="sm" onClick={onClick} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : children}
    </Button>
  );
}
