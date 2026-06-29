import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ResultCard } from './ResultCard';
import { ResultsLoading } from '@/components/ui/Skeleton';
import { countMatchingBits } from '@/utils/searchMap';
import { formatPersianNumber, formatResultRange } from '@/utils/paging';
import type { GroupedResult, ViewMode } from '@/types/ganjoor';

interface ResultsListProps {
  results: GroupedResult[];
  searchTerm: string;
  viewMode: ViewMode;
  loading: boolean;
  searched: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

function SearchGuide() {
  return (
    <div className="mt-4 rounded-xl bg-stone-50 p-4 text-right text-sm leading-7 text-stone-700">
      <p className="font-medium text-stone-800">راهنمای جستجو</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>یک کلمه یا عبارت کوتاه وارد کنید (مثلاً «جام»).</li>
        <li>برای عبارت دقیق از گیومه استفاده کنید: «جام می».</li>
        <li>چند کلمه با فاصله = هر کدام جداگانه جستجو می‌شود.</li>
        <li>پس از تغییر شاعر یا قالب، دوباره «جستجو» را بزنید.</li>
      </ul>
    </div>
  );
}

export function ResultsList({
  results,
  searchTerm,
  viewMode,
  loading,
  searched,
  page,
  pageSize,
  totalCount,
  totalPages,
}: ResultsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === 'verse' ? 280 : 360),
    overscan: 4,
  });

  if (loading && results.length === 0) {
    return <ResultsLoading />;
  }

  if (searched && !loading && results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
        <p className="text-lg text-stone-800">نتیجه‌ای یافت نشد.</p>
        <p className="mt-2 text-sm text-stone-600">
          لطفاً کلمهٔ دیگری را امتحان کنید یا فیلترها را تغییر دهید.
        </p>
        <SearchGuide />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-stone-600">
        <p>برای شروع، یک کلمه جستجو کنید.</p>
        <SearchGuide />
      </div>
    );
  }

  return (
    <div>
      <div
        className="mb-4 space-y-1 text-center text-sm text-stone-700"
        aria-live="polite"
      >
        {totalCount > 0 ? (
          <p>تعداد کل نتایج: {formatPersianNumber(totalCount)} غزل</p>
        ) : null}
        <p>
          {formatResultRange(page, pageSize, results.length, totalCount)}
          {totalPages > 1
            ? ` (صفحه ${formatPersianNumber(page)} از ${formatPersianNumber(totalPages)})`
            : ''}
          {loading ? ' — در حال به‌روزرسانی...' : ''}
        </p>
        <p className="text-xs text-stone-600">
          {countMatchingBits(results)} بیت مطابق در همین صفحه
        </p>
      </div>

      <div
        ref={parentRef}
        className="max-h-[70vh] overflow-auto rounded-2xl"
        role="list"
        aria-label="نتایج جستجو"
      >
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
                role="listitem"
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
