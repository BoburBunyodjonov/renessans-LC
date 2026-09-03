'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { FieldError, Honeypot, Input, Label } from '@/components/ui/field';
import { PhoneInput } from '@/components/shared/phone-input';
import { isCompleteUzPhone } from '@/lib/phone';

type FormValues = { name: string; phone: string; hp: string };

/**
 * Lead capture that stands between the last question and the result. The copy
 * states plainly that the result appears immediately after (PROMPT.md §8.3).
 */
export function ContactGate({
  submitting,
  error,
  skippable,
  timedOut,
  onSubmit,
  onSkip,
}: {
  submitting: boolean;
  error: boolean;
  skippable: boolean;
  timedOut: boolean;
  onSubmit: (contact: { name: string; phone: string }) => void;
  onSkip: () => void;
}) {
  const t = useTranslations('test');
  const tForms = useTranslations('forms');
  const [phone, setPhone] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { name: '', phone: '', hp: '' } });

  return (
    <Container className="flex min-h-[70vh] max-w-lg flex-col justify-center py-14">
      {timedOut ? (
        <p className="mb-6 rounded-md border border-warning/40 bg-warning/10 p-4 text-sm text-ink-900">
          {t('timeUp')}
        </p>
      ) : null}

      <div className="rounded-lg border border-ink-300/40 bg-white p-6 shadow-card md:p-8">
        <span className="mb-4 grid size-12 place-items-center rounded-md bg-brand-50 text-brand-600">
          <ShieldCheck className="size-6" aria-hidden />
        </span>
        <h1 className="text-2xl md:text-3xl">{t('contactGateTitle')}</h1>
        <p className="mt-2 text-sm text-ink-600">{t('contactGateText')}</p>

        <form
          onSubmit={handleSubmit((values) => onSubmit({ name: values.name, phone: values.phone }))}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
          <Honeypot name="hp-gate" />
          <input type="hidden" {...register('hp')} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gate-name">{tForms('name')}</Label>
            <Input
              id="gate-name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...register('name', {
                required: tForms('required'),
                minLength: { value: 2, message: tForms('required') },
              })}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gate-phone">{tForms('phone')}</Label>
            <PhoneInput
              id="gate-phone"
              placeholder={tForms('phonePlaceholder')}
              aria-invalid={Boolean(errors.phone)}
              value={phone}
              onChange={(value) => {
                setPhone(value);
                setValue('phone', value, { shouldValidate: Boolean(errors.phone) });
              }}
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

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {tForms('errorText')}
            </p>
          ) : null}

          <Button type="submit" size="lg" block disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                {t('submitting')}
              </>
            ) : (
              t('gateSubmit')
            )}
          </Button>

          {skippable ? (
            <Button type="button" variant="ghost" onClick={onSkip} disabled={submitting}>
              {t('skipGate')}
            </Button>
          ) : null}
        </form>
      </div>
    </Container>
  );
}
