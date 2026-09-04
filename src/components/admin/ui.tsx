import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-admin-text">{title}</h1>
        {description ? <p className="mt-1 text-sm text-admin-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn('rounded-lg border border-admin-border bg-admin-panel p-5 md:p-6', className)}
    >
      {children}
    </section>
  );
}

export function PanelTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-extrabold text-admin-text">{children}</h2>
      {hint ? <p className="mt-0.5 text-sm text-admin-muted">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-admin-border p-12 text-center">
      {icon ? <div className="text-admin-muted">{icon}</div> : null}
      <p className="font-display text-lg font-extrabold text-admin-text">{title}</p>
      {description ? <p className="max-w-md text-sm text-admin-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-admin-hover', className)} />;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  delta?: number | null;
  hint?: string;
  icon?: ReactNode;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-lg border border-admin-border bg-admin-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-admin-muted">{label}</p>
        {icon ? <span className="text-admin-muted">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-admin-text tabular-nums">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta !== null && delta !== undefined ? (
          <span
            className={
              positive ? 'font-bold text-success' : 'font-bold text-danger dark:text-admin-danger'
            }
          >
            {positive ? '+' : ''}
            {delta}%
          </span>
        ) : null}
        {hint ? <span className="text-admin-muted">{hint}</span> : null}
      </div>
    </div>
  );
}

const TONE_CLASSES = {
  neutral: 'bg-admin-hover text-admin-muted',
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-600/20 dark:text-admin-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-admin-warning',
  danger: 'bg-danger/10 text-danger dark:text-admin-danger',
} as const;

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: keyof typeof TONE_CLASSES;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}
