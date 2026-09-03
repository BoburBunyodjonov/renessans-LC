import { cn } from '@/lib/utils';

/**
 * Endless marquee. The content is duplicated in the DOM and the track is
 * translated by -50%, so the loop is seamless; CSS disables it entirely under
 * `prefers-reduced-motion`.
 */
function TickerRow({
  items,
  reverse = false,
  duration = 32,
  className,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={cn('marquee-root overflow-hidden', className)}>
      <div
        className="marquee-track"
        data-direction={reverse ? 'reverse' : undefined}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1}
            inert={copy === 1}
          >
            {items.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center">
                <span className="px-5 font-display text-sm font-extrabold tracking-[0.18em] uppercase md:text-base">
                  {item}
                </span>
                <span className="text-lg text-brand-500" aria-hidden>
                  ◆
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TickerSection({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 bg-ink-900 py-4 text-white md:py-5">
      <TickerRow items={items} />
      {/* Second row runs the other way on desktop only. */}
      <TickerRow items={[...items].reverse()} reverse duration={38} className="hidden md:block" />
    </div>
  );
}
