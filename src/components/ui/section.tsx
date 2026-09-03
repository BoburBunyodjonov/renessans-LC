import * as React from 'react';
import { cn } from '@/lib/utils';
import { Container } from './container';

type SectionProps = {
  id?: string;
  tone?: 'paper' | 'alt' | 'brand' | 'ink';
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
};

const toneClasses: Record<NonNullable<SectionProps['tone']>, string> = {
  paper: 'bg-paper',
  alt: 'bg-paper-alt',
  brand: 'bg-brand-600 text-white',
  ink: 'bg-ink-900 text-white',
};

export function Section({
  id,
  tone = 'paper',
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn('py-16 md:py-24 lg:py-28', toneClasses[tone], className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
  children?: React.ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  tone = 'light',
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-3 text-center md:mb-14',
        align === 'left' && 'md:text-left',
        align === 'center' && 'mx-auto max-w-2xl items-center',
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'text-xs font-bold tracking-[0.18em] uppercase',
            tone === 'light' ? 'text-brand-600' : 'text-white',
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2 className={cn('text-3xl md:text-4xl lg:text-5xl', tone === 'dark' && 'text-white')}>
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            'max-w-2xl text-base md:text-lg',
            align === 'left' && 'md:mx-0',
            'mx-auto',
            tone === 'light' ? 'text-ink-600' : 'text-white/80',
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {children}
    </div>
  );
}
