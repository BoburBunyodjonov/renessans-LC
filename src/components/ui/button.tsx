import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0 motion-safe:hover:-translate-y-0.5 active:scale-[0.98]',
  {
    variants: {
      variant: {
        brand: 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand',
        dark: 'bg-ink-900 text-white hover:bg-ink-700 hover:shadow-card',
        outline:
          'border-[1.5px] border-ink-900 bg-transparent text-ink-900 hover:bg-ink-900 hover:text-white',
        ghost: 'bg-transparent text-ink-900 hover:bg-ink-100',
        white: 'bg-white text-ink-900 hover:bg-brand-50 hover:shadow-card',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-[0.9375rem] md:h-13 md:px-7',
        lg: 'h-13 px-7 text-base md:h-14 md:px-9 md:text-lg',
        icon: 'size-12 p-0',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'brand', size: 'md', block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...(asChild ? {} : { type })}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
