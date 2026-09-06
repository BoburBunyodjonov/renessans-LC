import { Container } from '@/components/ui/container';
import { SkeletonBreadcrumbs, SkeletonCardGrid, SkeletonHeader } from '@/components/ui/skeleton';

/** Teachers: a header over a four-column grid of portrait cards. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="py-10 md:py-14">
        <SkeletonHeader className="mb-8" />
        <SkeletonCardGrid count={4} ratio="aspect-4/5" />
      </Container>
    </>
  );
}
