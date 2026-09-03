'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, Loader2, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldError, Honeypot, Input, Label, Textarea } from '@/components/ui/field';
import { PhoneInput } from '@/components/shared/phone-input';
import { isCompleteUzPhone } from '@/lib/phone';
import { MAX_SIZE } from '@/lib/upload';
import { track } from '@/lib/analytics';

type FormValues = {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  about: string;
  consent: boolean;
  hp: string;
};

const ACCEPT = '.pdf,.doc,.docx';

export function ApplicationForm({ vacancyId }: { vacancyId: string }) {
  const t = useTranslations('careers');
  const tForms = useTranslations('forms');
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      birthDate: '',
      about: '',
      consent: false,
      hp: '',
    },
  });

  const phone = watch('phone');

  async function onSubmit(values: FormValues) {
    setStatus('idle');
    setFileError(null);

    const file = fileRef.current?.files?.[0];
    if (file && file.size > MAX_SIZE.document) {
      setFileError(t('cvInvalid'));
      return;
    }

    const body = new FormData();
    body.set('vacancyId', vacancyId);
    body.set('fullName', values.fullName);
    body.set('phone', values.phone);
    body.set('email', values.email);
    body.set('birthDate', values.birthDate);
    body.set('about', values.about);
    body.set('consent', values.consent ? 'true' : '');
    body.set('locale', locale);
    body.set('hp', values.hp);
    if (file) body.set('cv', file);

    const response = await fetch('/api/applications', { method: 'POST', body });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: { fields?: Record<string, string> };
      } | null;
      if (payload?.error?.fields?.cv) setFileError(t('cvInvalid'));
      setStatus('error');
      return;
    }

    track('vacancy_applied', { vacancy_id: vacancyId });
    setStatus('success');
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Honeypot name="hp-application" />
      <input type="hidden" {...register('hp')} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="app-name">{t('fullName')}</Label>
        <Input
          id="app-name"
          autoComplete="name"
          aria-invalid={Boolean(errors.fullName)}
          {...register('fullName', {
            required: tForms('required'),
            minLength: { value: 2, message: tForms('required') },
          })}
        />
        <FieldError>{errors.fullName?.message}</FieldError>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="app-phone">{tForms('phone')}</Label>
        <PhoneInput
          id="app-phone"
          placeholder={tForms('phonePlaceholder')}
          aria-invalid={Boolean(errors.phone)}
          value={phone}
          onChange={(value) => setValue('phone', value, { shouldValidate: Boolean(errors.phone) })}
        />
        <input
          type="hidden"
          {...register('phone', {
            required: tForms('required'),
            validate: (value) => isCompleteUzPhone(value) || tForms('invalidPhone'),
          })}
        />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="app-email">{tForms('email')}</Label>
          <Input id="app-email" type="email" autoComplete="email" {...register('email')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="app-birth">{t('birthDate')}</Label>
          <Input id="app-birth" type="date" {...register('birthDate')} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="app-about">{t('about')}</Label>
        <Textarea id="app-about" rows={4} {...register('about')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="app-cv">{t('cv')}</Label>
        <input
          ref={fileRef}
          id="app-cv"
          type="file"
          accept={ACCEPT}
          onChange={(event) => {
            setFileError(null);
            setFileName(event.target.files?.[0]?.name ?? null);
          }}
          className="sr-only"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip aria-hidden />
            {t('chooseFile')}
          </Button>
          {fileName ? <span className="truncate text-sm text-ink-600">{fileName}</span> : null}
        </div>
        <p className="text-xs text-ink-600">{t('cvHint')}</p>
        <FieldError>{fileError}</FieldError>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-ink-600">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-brand-600"
          aria-invalid={Boolean(errors.consent)}
          {...register('consent', { required: t('consentRequired') })}
        />
        {t('consent')}
      </label>
      <FieldError>{errors.consent?.message}</FieldError>

      {status === 'error' ? (
        <p role="alert" className="text-sm text-danger">
          {tForms('errorText')}
        </p>
      ) : null}

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {tForms('sending')}
          </>
        ) : (
          <>
            {t('apply')}
            <Send aria-hidden />
          </>
        )}
      </Button>
    </form>
  );
}
