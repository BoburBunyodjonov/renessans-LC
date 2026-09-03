'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm font-semibold text-ink-900', className)}
      {...props}
    />
  );
}

const inputClasses =
  'border-ink-300/70 text-ink-900 placeholder:text-ink-400 focus:border-brand-500 h-12 w-full rounded-sm border bg-white px-4 text-base transition-colors outline-none disabled:opacity-60 aria-[invalid=true]:border-danger';

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn(inputClasses, 'h-auto min-h-28 py-3', className)} {...props} />;
}

function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {children}
    </p>
  );
}

/** Off-screen input bots fill in and humans never see. */
function Honeypot({ name = 'hp' }: { name?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0">
      <label htmlFor={`${name}-field`}>Leave this field empty</label>
      <input id={`${name}-field`} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export { FieldError, Honeypot, Input, Label, Textarea, inputClasses };
