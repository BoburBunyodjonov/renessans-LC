import { Container } from '@/components/ui/container';
import {
  Skeleton,
  SkeletonBreadcrumbs,
  SkeletonHeader,
  SkeletonText,
} from '@/components/ui/skeleton';

/** Problems and solutions: paired cards, two to a row. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="py-10 md:py-14">
        <SkeletonHeader className="mb-8" />
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-lg border border-ink-300/40 bg-white p-6">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <SkeletonText lines={2} className="mt-3" />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
