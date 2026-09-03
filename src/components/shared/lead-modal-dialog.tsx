'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeadForm, type LeadFormCourse } from '@/components/shared/lead-form';
import type { LeadSourceKey } from '@/types/lead';

/**
 * The dialog itself (Radix + react-hook-form) lives in its own chunk so it is
 * only downloaded once a visitor actually opens a CTA.
 */
export default function LeadModalDialog({
  open,
  onOpenChange,
  courses,
  source,
  courseId,
  title,
  description,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: LeadFormCourse[];
  source: LeadSourceKey;
  courseId?: string;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}) {
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon('close')} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? t('leadTitle')}</DialogTitle>
          <DialogDescription>{description ?? t('leadDescription')}</DialogDescription>
        </DialogHeader>
        <LeadForm
          key={`${source}:${courseId ?? ''}`}
          source={source}
          courses={courses}
          courseId={courseId}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
