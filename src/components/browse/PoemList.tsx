import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PoemSummary } from '@/types/ganjoor';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';

const PAGE_SIZE = 40;
const VIRTUAL_THRESHOLD = 80;

interface PoemListProps {
  title: string;
  poems: PoemSummary[];
  loading?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (poem: PoemSummary) => void;
  onBack: () => void;
  showBack?: boolean;
}

export function PoemList({
  title,
  poems,
  loading,
  page,
  onPageChange,
  onSelect,
  onBack,
  showBack = true,
}: PoemListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.max(1, Math.ceil(poems.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagePoems = poems.slice(start, start + PAGE_SIZE);
  const useVirtual = pagePoems.length >= VIRTUAL_THRESHOLD;

  const virtualizer = useVirtualizer({
    count: useVirtual ? pagePoems.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 8,
  });

  return (
    <section>
      <div className="mb-5">
        {showBack ? (
          <button
            type="button"
            className="text-muted hover:text-[var(--color-ink)] mb-3 inline-flex min-h-[44px] items-center gap-1 text-sm"
            onClick={onBack}
          >
            <ChevronRight size={16} />
            بازگشت
          </button>
        ) : null}
        <h2 className="text-2xl font-bold">{title}</h2>
        {!loading && poems.length > 0 ? (
          <p className="text-muted mt-2 text-sm">
            {poems.length.toLocaleString('fa-IR')} قطعه
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : pagePoems.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">قطعه‌ای یافت نشد.</p>
      ) : useVirtual ? (
        <div ref={parentRef} className="max-h-[70vh] overflow-y-auto">
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((item) => {
              const poem = pagePoems[item.index]!;
              return (
                <button
                  key={poem.id}
                  type="button"
                  className="surface-card hover:border-[var(--color-accent)] absolute start-0 top-0 flex min-h-[56px] w-full items-center gap-3 rounded-2xl border p-4 text-start transition-colors"
                  style={{ transform: `translateY(${item.start}px)` }}
                  onClick={() => onSelect(poem)}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{poem.title}</h3>
                    {poem.excerpt ? (
                      <p className="text-muted mt-2 line-clamp-2 text-sm leading-7">{poem.excerpt}</p>
                    ) : null}
                  </div>
                  <ChevronLeft size={18} className="text-subtle shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {pagePoems.map((poem, index) => (
            <button
              key={poem.id}
              type="button"
              className="surface-card hover:border-[var(--color-accent)] fade-in flex min-h-[56px] w-full items-center gap-3 rounded-2xl border p-4 text-start transition-colors"
              style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
              onClick={() => onSelect(poem)}
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{poem.title}</h3>
                {poem.excerpt ? (
                  <p className="text-muted mt-2 line-clamp-2 text-sm leading-7">{poem.excerpt}</p>
                ) : null}
              </div>
              <ChevronLeft size={18} className="text-subtle shrink-0" />
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <Pagination
          page={page}
          hasMore={page < totalPages}
          totalPages={totalPages}
          onPageChange={(nextPage) => {
            onPageChange(nextPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={loading}
        />
      ) : null}
    </section>
  );
}

export { PAGE_SIZE as POEM_LIST_PAGE_SIZE };
