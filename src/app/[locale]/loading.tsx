import { Container } from '@/components/ui/container';

/** Route-level skeleton shown while a locale page streams in. */
export default function LocaleLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-brand-600/90 py-16 md:py-24">
        <Container className="flex flex-col gap-5">
          <div className="h-10 w-3/4 rounded-lg bg-white/20 md:h-16" />
          <div className="h-5 w-1/2 rounded bg-white/15" />
          <div className="h-12 w-56 rounded-full bg-white/25" />
        </Container>
      </div>

      <Container className="py-14">
        <div className="mb-8 h-8 w-64 rounded bg-ink-100" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-lg border border-ink-300/40 p-6">
              <div className="mb-4 h-32 rounded-md bg-ink-100" />
              <div className="mb-2 h-5 w-2/3 rounded bg-ink-100" />
              <div className="h-4 w-full rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
