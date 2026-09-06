import { Container } from '@/components/ui/container';
import { Skeleton, SkeletonBreadcrumbs, SkeletonText } from '@/components/ui/skeleton';

/** A post: title, meta line, cover, then paragraphs. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="max-w-3xl py-8 md:py-12">
        <Skeleton className="h-10 w-full md:h-14" />
        <Skeleton className="mt-3 h-10 w-3/4 md:h-14" />

        <div className="mt-5 flex gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>

        <Skeleton className="mt-8 aspect-16/9 w-full rounded-lg" />

        <div className="mt-8 flex flex-col gap-6">
          {Array.from({ length: 2 }, (_, index) => (
            <SkeletonText key={index} lines={4} />
          ))}
        </div>
      </Container>
    </>
  );
}
