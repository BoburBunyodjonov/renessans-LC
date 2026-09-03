/**
 * Placeholder shown while the filter UI hydrates. It mirrors the real layout —
 * chips, search row and a card grid — so the page does not jump when the list
 * takes over (the browser reads filter state from the URL, which forces that
 * subtree to render on the client).
 */
export function MaterialBrowserSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-hidden>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-10 w-28 rounded-full bg-ink-100" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="h-10 w-36 rounded-full bg-ink-100" />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-12 w-full max-w-sm rounded-sm bg-ink-100" />
          <div className="ms-auto h-4 w-24 rounded bg-ink-100" />
        </div>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="h-64 rounded-lg border border-ink-300/40 bg-white p-5">
            <div className="mb-3 h-6 w-24 rounded-full bg-ink-100" />
            <div className="mb-2 h-5 w-3/4 rounded bg-ink-100" />
            <div className="mb-6 h-4 w-full rounded bg-ink-100" />
            <div className="mt-auto h-10 w-32 rounded-full bg-ink-100" />
          </li>
        ))}
      </ul>
    </div>
  );
}
