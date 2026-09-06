import { Container } from '@/components/ui/container';
import { SkeletonBreadcrumbs, SkeletonCardGrid, SkeletonHeader } from '@/components/ui/skeleton';

/** Materials: a grid of downloadable sets. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="py-10 md:py-14">
        <SkeletonHeader className="mb-8" />
        <SkeletonCardGrid count={3} columns="sm:grid-cols-2 lg:grid-cols-3" ratio="aspect-16/10" />
      </Container>
    </>
  );
}
