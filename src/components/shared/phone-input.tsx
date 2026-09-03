'use client';

import * as React from 'react';
import { formatUzPhone } from '@/lib/phone';
import { Input } from '@/components/ui/field';

type PhoneInputProps = Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> & {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Masked `+998 (__) ___-__-__` field. The masked string is what the form holds;
 * the server normalises it back to E.164 before validating.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onChange, onFocus, ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      onFocus={(event) => {
        if (!event.target.value) onChange('+998 ');
        onFocus?.(event);
      }}
      onChange={(event) => onChange(formatUzPhone(event.target.value))}
      {...props}
    />
  );
});
