import { Container } from '@/components/ui/container';
import { SkeletonBreadcrumbs, SkeletonCardGrid, SkeletonHeader } from '@/components/ui/skeleton';

/** Choose your level: the two placement papers, side by side. */
export default function Loading() {
  return (
    <>
      <Container className="pt-8">
        <SkeletonBreadcrumbs />
      </Container>

      <Container className="py-10 md:py-14">
        <SkeletonHeader className="mb-8" />
        <SkeletonCardGrid count={2} columns="md:grid-cols-2" ratio="aspect-16/9" />
      </Container>
    </>
  );
}
