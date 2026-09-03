import { Skeleton, TableSkeleton } from '@/components/admin/ui';

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
}
