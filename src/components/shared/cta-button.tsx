'use client';

import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useLeadModal } from '@/components/shared/lead-modal';
import type { LeadSourceKey } from '@/types/lead';

/** Any CTA that should open the lead modal instead of navigating. */
export function CtaButton({
  source,
  courseId,
  children,
  ...buttonProps
}: ButtonProps & { source: LeadSourceKey; courseId?: string; children: ReactNode }) {
  const { open } = useLeadModal();

  return (
    <Button {...buttonProps} onClick={() => open({ source, courseId })}>
      {children}
    </Button>
  );
}
