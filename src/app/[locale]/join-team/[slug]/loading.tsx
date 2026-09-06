import { Container } from '@/components/ui/container';
import { Skeleton, SkeletonBreadcrumbs, SkeletonText } from '@/components/ui/skeleton';

/** A vacancy: the description column beside the application form. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-2/3 md:h-12" />
            <SkeletonText lines={4} />
            <SkeletonText lines={5} />
          </div>

          <div className="rounded-lg border border-ink-300/40 bg-white p-6">
            <Skeleton className="h-6 w-40" />
            <div className="mt-5 flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))}
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
