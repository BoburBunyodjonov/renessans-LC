'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label } from '@/components/ui/field';

type FormValues = { email: string; password: string };

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, setError] = useState(false);
  const t = useTranslations('admin');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: { email: '', password: '' } });

  async function onSubmit(values: FormValues) {
    setError(false);
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error || !result?.ok) {
      // Deliberately generic: the server never says which half was wrong.
      setError(true);
      return;
    }

    window.location.href = callbackUrl && callbackUrl.startsWith('/admin') ? callbackUrl : '/admin';
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-lg border border-ink-300/50 bg-white p-6 shadow-card dark:border-white/10 dark:bg-ink-900"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="dark:text-white">
          {t('login.email')}
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          aria-invalid={Boolean(errors.email)}
          className="dark:border-white/15 dark:bg-white/5 dark:text-white"
          {...register('email', { required: t('login.emailRequired') })}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="dark:text-white">
          {t('login.password')}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          className="dark:border-white/15 dark:bg-white/5 dark:text-white"
          {...register('password', { required: t('login.passwordRequired') })}
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {t('login.invalid')}
        </p>
      ) : null}

      <Button type="submit" size="lg" block disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <>
            <LogIn aria-hidden />
            {t('signIn')}
          </>
        )}
      </Button>
    </form>
  );
}
