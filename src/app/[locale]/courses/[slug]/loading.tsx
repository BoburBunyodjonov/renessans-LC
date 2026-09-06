import { Container } from '@/components/ui/container';
import { Skeleton, SkeletonBreadcrumbs, SkeletonText } from '@/components/ui/skeleton';

/** A course: the hero panel, then the detail column beside a sticky card. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-3/4 md:h-14" />
            <SkeletonText lines={3} />
            <Skeleton className="aspect-16/9 w-full rounded-lg" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className="rounded-lg border border-ink-300/40 p-5">
                  <Skeleton className="h-5 w-1/3" />
                  <SkeletonText lines={2} className="mt-3" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-ink-300/40 bg-white p-6">
            <Skeleton className="h-8 w-32" />
            <SkeletonText lines={3} className="mt-4" />
            <Skeleton className="mt-6 h-12 w-full rounded-full" />
          </div>
        </div>
      </Container>
    </>
  );
}
