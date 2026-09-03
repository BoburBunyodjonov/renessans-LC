'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldError, Honeypot, Input, Label, Textarea } from '@/components/ui/field';
import { PhoneInput } from '@/components/shared/phone-input';
import { isCompleteUzPhone } from '@/lib/phone';
import { cn } from '@/lib/utils';

type FormValues = {
  name: string;
  phone: string;
  message: string;
  hp: string;
};

export function ContactForm({ className }: { className?: string }) {
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
    defaultValues: { name: '', phone: '', message: '', hp: '' },
  });

  const phone = watch('phone');

  async function onSubmit(values: FormValues) {
    setStatus('idle');
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        phone: values.phone || undefined,
        message: values.message,
        locale,
        page: window.location.pathname,
        hp: values.hp,
      }),
    });

    setStatus(response.ok ? 'success' : 'error');
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-8 text-center">
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
        <Label htmlFor="contact-name">{t('name')}</Label>
        <Input
          id="contact-name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register('name', {
            required: t('required'),
            minLength: { value: 2, message: t('required') },
          })}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-phone">{t('phone')}</Label>
        <PhoneInput
          id="contact-phone"
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">{t('message')}</Label>
        <Textarea
          id="contact-message"
          rows={4}
          aria-invalid={Boolean(errors.message)}
          {...register('message', {
            required: t('required'),
            minLength: { value: 5, message: t('required') },
          })}
        />
        <FieldError>{errors.message?.message}</FieldError>
      </div>

      {status === 'error' ? (
        <p role="alert" className="text-sm text-danger">
          {t('errorText')}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {t('sending')}
          </>
        ) : (
          <>
            {t('send')}
            <Send aria-hidden />
          </>
        )}
      </Button>
    </form>
  );
}
