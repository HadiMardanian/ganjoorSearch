import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPersianNumber } from '@/utils/paging';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  hasMore: boolean;
  totalPages?: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  page,
  hasMore,
  totalPages = 0,
  onPageChange,
  disabled,
}: PaginationProps) {
  if (page === 1 && !hasMore && totalPages <= 1) return null;

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

      <span className="min-w-32 text-center text-sm text-stone-600">
        صفحه {formatPersianNumber(page)}
        {totalPages > 0 ? ` از ${formatPersianNumber(totalPages)}` : ''}
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
