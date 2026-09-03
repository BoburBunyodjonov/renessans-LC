'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldError, Honeypot, Input, Label, Textarea, inputClasses } from '@/components/ui/field';
import { PhoneInput } from '@/components/shared/phone-input';
import { isCompleteUzPhone } from '@/lib/phone';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { LeadSourceKey } from '@/types/lead';

export type LeadFormCourse = { id: string; title: string };

type FormValues = {
  name: string;
  phone: string;
  courseId: string;
  preferredTime: string;
  message: string;
  hp: string;
};

type LeadFormProps = {
  source: LeadSourceKey;
  courses?: LeadFormCourse[];
  courseId?: string;
  withMessage?: boolean;
  submitLabel?: string;
  className?: string;
  onSuccess?: () => void;
};

export function LeadForm({
  source,
  courses = [],
  courseId,
  withMessage = false,
  submitLabel,
  className,
  onSuccess,
}: LeadFormProps) {
  const t = useTranslations('forms');
  const locale = useLocale();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      phone: '',
      courseId: courseId ?? '',
      preferredTime: '',
      message: '',
      hp: '',
    },
  });

  const phone = watch('phone');

  async function onSubmit(values: FormValues) {
    setStatus('idle');

    const params = new URLSearchParams(window.location.search);
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        phone: values.phone,
        courseId: values.courseId || undefined,
        preferredTime: values.preferredTime || undefined,
        message: values.message || undefined,
        source,
        locale,
        page: window.location.pathname,
        referrer: document.referrer || undefined,
        utmSource: params.get('utm_source') ?? undefined,
        utmMedium: params.get('utm_medium') ?? undefined,
        utmCampaign: params.get('utm_campaign') ?? undefined,
        utmContent: params.get('utm_content') ?? undefined,
        utmTerm: params.get('utm_term') ?? undefined,
        hp: values.hp,
      }),
    });

    if (!response.ok) {
      setStatus('error');
      return;
    }

    track('lead_submitted', { source, course_id: values.courseId || undefined });
    setStatus('success');
    onSuccess?.();
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-success/30 bg-success/5 p-6 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden />
        <p className="font-display text-lg font-extrabold text-ink-900">{t('successTitle')}</p>
        <p className="text-sm text-ink-600">{t('successText')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-4', className)}
      noValidate
    >
      <Honeypot />
      <input type="hidden" {...register('hp')} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-name">{t('name')}</Label>
        <Input
          id="lead-name"
          autoComplete="name"
          placeholder={t('namePlaceholder')}
          aria-invalid={Boolean(errors.name)}
          {...register('name', {
            required: t('required'),
            minLength: { value: 2, message: t('required') },
          })}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-phone">{t('phone')}</Label>
        <PhoneInput
          id="lead-phone"
          placeholder={t('phonePlaceholder')}
          aria-invalid={Boolean(errors.phone)}
          value={phone}
          onChange={(value) => setValue('phone', value, { shouldValidate: Boolean(errors.phone) })}
        />
        <input
          type="hidden"
          {...register('phone', {
            required: t('required'),
            validate: (value) => isCompleteUzPhone(value) || t('invalidPhone'),
          })}
        />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>

      {courses.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-course">{t('course')}</Label>
          <select id="lead-course" className={cn(inputClasses, 'pe-10')} {...register('courseId')}>
            <option value="">—</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" {...register('courseId')} />
      )}

      {withMessage ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-message">{t('message')}</Label>
          <Textarea id="lead-message" rows={4} {...register('message')} />
        </div>
      ) : null}

      {status === 'error' ? (
        <p role="alert" className="text-sm text-danger">
          {t('errorText')}
        </p>
      ) : null}

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {t('sending')}
          </>
        ) : (
          <>
            {submitLabel ?? t('send')}
            <Send aria-hidden />
          </>
        )}
      </Button>
    </form>
  );
}
