import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-xs font-bold tracking-wide uppercase',
  {
    variants: {
      variant: {
        brand: 'bg-brand-50 text-brand-600',
        ink: 'bg-ink-900 text-white',
        outline: 'border border-ink-300/70 text-ink-600',
        light: 'bg-white/15 text-white',
        success: 'bg-success/10 text-success',
      },
      size: {
        sm: 'px-2.5 py-1 text-[0.6875rem]',
        md: 'px-3 py-1.5',
      },
    },
    defaultVariants: { variant: 'brand', size: 'sm' },
  },
);

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
