interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />;
}

export function ResultSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <Skeleton className="mb-4 h-6 w-1/3" />
      <Skeleton className="mb-3 h-5 w-full" />
      <Skeleton className="mb-3 h-5 w-5/6" />
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export function ResultsLoading() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <p className="text-center text-stone-500">در حال جستجو...</p>
      {Array.from({ length: 3 }).map((_, index) => (
        <ResultSkeleton key={index} />
      ))}
    </div>
  );
}
