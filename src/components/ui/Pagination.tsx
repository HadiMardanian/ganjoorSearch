import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, hasMore, onPageChange, disabled }: PaginationProps) {
  if (page === 1 && !hasMore) return null;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-4"
      aria-label="صفحه‌بندی نتایج"
    >
      <Button
        variant="secondary"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="صفحه قبل"
      >
        <ChevronRight size={18} />
        صفحه قبل
      </Button>

      <span className="min-w-24 text-center text-sm text-stone-600">
        صفحه {page}
      </span>

      <Button
        variant="secondary"
        disabled={disabled || !hasMore}
        onClick={() => onPageChange(page + 1)}
        aria-label="صفحه بعد"
      >
        صفحه بعد
        <ChevronLeft size={18} />
      </Button>
    </nav>
  );
}
