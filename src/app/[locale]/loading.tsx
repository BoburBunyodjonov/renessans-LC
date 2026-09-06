import { Container } from '@/components/ui/container';
import { Skeleton, SkeletonHeader, SkeletonText } from '@/components/ui/skeleton';

/**
 * The fallback for the locale segment, which covers the home page and stands in
 * for a child route for the moment before that route's own skeleton takes over.
 *
 * Deliberately neutral. It used to be shaped like the home page — a red hero
 * over a card grid — which meant every inner page flashed a hero it does not
 * have before settling into its real layout.
 */
export default function LocaleLoading() {
  return (
    <Container className="py-12 md:py-16">
      <SkeletonHeader className="mb-10" />

      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-16/10 w-full rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </Container>
  );
}
