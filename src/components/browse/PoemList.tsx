import { ChevronLeft } from 'lucide-react';
import type { PoemSummary } from '@/types/ganjoor';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';

const PAGE_SIZE = 40;

interface PoemListProps {
  title: string;
  poems: PoemSummary[];
  loading?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (poem: PoemSummary) => void;
  onBack: () => void;
}

export function PoemList({
  title,
  poems,
  loading,
  page,
  onPageChange,
  onSelect,
  onBack,
}: PoemListProps) {
  const totalPages = Math.max(1, Math.ceil(poems.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagePoems = poems.slice(start, start + PAGE_SIZE);

  return (
    <section>
      <div className="mb-5">
        <button
          type="button"
          className="text-muted hover:text-[var(--color-ink)] mb-3 inline-flex items-center gap-1 text-sm"
          onClick={onBack}
        >
          <ChevronLeft size={16} />
          بازگشت
        </button>
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
      ) : (
        <div className="space-y-3">
          {pagePoems.map((poem) => (
            <button
              key={poem.id}
              type="button"
              className="surface-card hover:border-[var(--color-accent)] w-full rounded-2xl border p-4 text-right transition-colors"
              onClick={() => onSelect(poem)}
            >
              <h3 className="font-semibold">{poem.title}</h3>
              {poem.excerpt ? (
                <p className="text-muted mt-2 line-clamp-2 text-sm leading-7">{poem.excerpt}</p>
              ) : null}
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
