import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ResultCard } from './ResultCard';
import { ResultsLoading } from '@/components/ui/Skeleton';
import { countMatchingBits } from '@/utils/searchMap';
import type { GroupedResult, ViewMode } from '@/types/ganjoor';

interface ResultsListProps {
  results: GroupedResult[];
  searchTerm: string;
  viewMode: ViewMode;
  loading: boolean;
  isFetching: boolean;
  searched: boolean;
}

export function ResultsList({
  results,
  searchTerm,
  viewMode,
  loading,
  isFetching,
  searched,
}: ResultsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === 'verse' ? 280 : 360),
    overscan: 4,
  });

  const matchingBits = countMatchingBits(results);

  if (loading && results.length === 0) {
    return <ResultsLoading />;
  }

  if (searched && !loading && results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center dark:border-stone-600 dark:bg-stone-900/40">
        <p className="text-lg text-stone-700 dark:text-stone-200">نتیجه‌ای یافت نشد.</p>
        <p className="mt-2 text-sm text-stone-500">لطفاً کلمهٔ دیگری را امتحان کنید.</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-6 py-16 text-center text-stone-500 dark:border-stone-600 dark:bg-stone-900/40">
        برای شروع، یک کلمه جستجو کنید.
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-center text-sm text-stone-600 dark:text-stone-400">
        {results.length} شعر، {matchingBits} بیت مطابق
        {isFetching ? ' — در حال به‌روزرسانی...' : ''}
      </p>

      <div ref={parentRef} className="max-h-[70vh] overflow-auto rounded-2xl">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const result = results[virtualItem.index];
            return (
              <div
                key={result.poemId}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="pb-4"
              >
                <ResultCard
                  result={result}
                  searchTerm={searchTerm}
                  viewMode={viewMode}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
