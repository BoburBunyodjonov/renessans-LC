import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Paths are already locale-prefixed, so this uses the plain next/link. */
export function Breadcrumbs({
  items,
  tone = 'light',
  className,
}: {
  items: { name: string; path: string }[];
  tone?: 'light' | 'dark';
  className?: string;
}) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          'flex flex-wrap items-center gap-1.5 text-sm',
          tone === 'dark' ? 'text-white/80' : 'text-ink-600',
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden /> : null}
              {isLast ? (
                <span
                  aria-current="page"
                  className={tone === 'dark' ? 'text-white' : 'text-ink-900'}
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className={cn(
                    'transition-colors',
                    tone === 'dark' ? 'hover:text-white' : 'hover:text-brand-600',
                  )}
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
