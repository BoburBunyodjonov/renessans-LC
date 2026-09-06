import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * The test runner: the progress bar and timer sit in a fixed strip above one
 * question, so the placeholder keeps that strip and reserves a question's worth
 * of options below it.
 */
export default function Loading() {
  return (
    <>
      <div className="border-b border-ink-300/40">
        <Container className="flex items-center gap-4 py-3">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-4 w-14" />
        </Container>
      </div>

      <Container className="max-w-3xl py-10 md:py-14">
        <Skeleton className="h-7 w-3/4 md:h-8" />
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
        <div className="mt-8 flex justify-between">
          <Skeleton className="h-11 w-28 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </Container>
    </>
  );
}
