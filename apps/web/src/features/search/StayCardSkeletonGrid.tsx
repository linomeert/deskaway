import { Skeleton } from "../../components/Skeleton";

export const STAY_GRID =
  "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4";

interface StayCardSkeletonGridProps {
  count: number;
  label: string;
}

export function StayCardSkeletonGrid({
  count,
  label,
}: StayCardSkeletonGridProps) {
  return (
    <div aria-busy="true" className={STAY_GRID}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
