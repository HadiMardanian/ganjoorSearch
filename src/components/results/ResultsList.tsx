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
    <div className="surface-muted mt-4 rounded-xl p-4 text-right text-sm leading-7 text-muted">
      <p className="font-medium">راهنمای جستجو</p>
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
  if (loading && results.length === 0) {
    return <ResultsLoading />;
  }

  if (searched && !loading && results.length === 0) {
    return (
      <div className="surface-card rounded-2xl border border-dashed px-6 py-16 text-center">
        <p className="text-lg">نتیجه‌ای یافت نشد.</p>
        <p className="text-muted mt-2 text-sm">
          لطفاً کلمهٔ دیگری را امتحان کنید یا فیلترها را تغییر دهید.
        </p>
        <SearchGuide />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="surface-card rounded-2xl border border-dashed px-6 py-16 text-center text-muted">
        <p>برای شروع، یک کلمه جستجو کنید.</p>
        <SearchGuide />
      </div>
    );
  }

  return (
    <div>
      <div
        className="text-muted mb-4 space-y-1 text-center text-sm"
        aria-live="polite"
      >
        {totalCount > 0 ? (
          <p>تعداد کل نتایج: {formatPersianNumber(totalCount)} قطعه</p>
        ) : null}
        <p>
          {formatResultRange(page, pageSize, results.length, totalCount)}
          {totalPages > 1
            ? ` (صفحه ${formatPersianNumber(page)} از ${formatPersianNumber(totalPages)})`
            : ''}
          {loading ? ' — در حال به‌روزرسانی...' : ''}
        </p>
        <p className="text-subtle text-xs">
          {countMatchingBits(results)} بیت مطابق در همین صفحه
        </p>
      </div>

      <div className="space-y-4" role="list" aria-label="نتایج جستجو">
        {results.map((result) => (
          <div key={result.poemId} role="listitem">
            <ResultCard result={result} searchTerm={searchTerm} viewMode={viewMode} />
          </div>
        ))}
      </div>
    </div>
  );
}
