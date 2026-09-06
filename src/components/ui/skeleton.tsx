import { cn } from '@/lib/utils';

/**
 * Placeholders shown while a route streams in.
 *
 * They are deliberately shaped like the page that follows — a grid of cards
 * stays a grid of cards, an article stays a column of lines — so the layout
 * does not jump when the real content arrives. A generic spinner would be
 * quicker to write and would move everything on screen the moment it resolved.
 *
 * The pulse is a plain CSS animation; `prefers-reduced-motion` already stops it
 * globally in `globals.css`, which leaves the shapes visible but still.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-ink-100', className)} />;
}

/** A paragraph's worth of lines, the last one short like real text. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn('h-4', index === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

/** The title block most pages open with. */
export function SkeletonHeader({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-3 text-center', className)}>
      <Skeleton className="h-9 w-64 md:h-11 md:w-96" />
      <Skeleton className="h-4 w-72 md:w-[28rem]" />
    </div>
  );
}

/**
 * A card with a picture on top — teachers, courses, posts. `ratio` matches the
 * real card so the reserved space is the right height.
 */
export function SkeletonCard({
  ratio = 'aspect-4/5',
  lines = 2,
}: {
  ratio?: string;
  lines?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-300/40 bg-white">
      <Skeleton className={cn('w-full rounded-none', ratio)} />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <SkeletonText lines={lines} />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({
  count = 4,
  columns = 'sm:grid-cols-2 lg:grid-cols-4',
  ratio,
}: {
  count?: number;
  columns?: string;
  ratio?: string;
}) {
  return (
    <div className={cn('grid gap-5', columns)}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} ratio={ratio} />
      ))}
    </div>
  );
}

/** The breadcrumb line every inner page opens with. */
export function SkeletonBreadcrumbs() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="h-3.5 w-3" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  );
}
