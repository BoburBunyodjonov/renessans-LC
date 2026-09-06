import { Container } from '@/components/ui/container';
import { Skeleton, SkeletonBreadcrumbs, SkeletonHeader } from '@/components/ui/skeleton';

/** Contact: the form on the left, the map panel on the right. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="py-10 md:py-14">
        <SkeletonHeader className="mb-8" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
          <Skeleton className="h-80 w-full rounded-lg lg:h-full" />
        </div>
      </Container>
    </>
  );
}
