import { Container } from '@/components/ui/container';
import {
  Skeleton,
  SkeletonBreadcrumbs,
  SkeletonHeader,
  SkeletonText,
} from '@/components/ui/skeleton';

/** Vacancies: a stack of rows rather than a grid. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="py-10 md:py-14">
        <SkeletonHeader className="mb-8" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-lg border border-ink-300/40 bg-white p-6">
              <Skeleton className="h-6 w-1/3" />
              <SkeletonText lines={2} className="mt-3" />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
