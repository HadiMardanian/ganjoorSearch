import { useState } from 'react';
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
  const [jumpValue, setJumpValue] = useState('');

  if (page === 1 && !hasMore && totalPages <= 1) return null;

  function handleJump(event: React.FormEvent) {
    event.preventDefault();
    const target = Number(jumpValue);
    if (!Number.isFinite(target) || target < 1) return;
    const maxPage = totalPages > 0 ? totalPages : page + (hasMore ? 1 : 0);
    onPageChange(Math.min(Math.max(1, Math.floor(target)), maxPage));
    setJumpValue('');
  }

  return (
    <nav
      className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
      aria-label="صفحه‌بندی نتایج"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="صفحه قبل"
        >
          <ChevronRight size={18} />
          صفحه قبل
        </Button>

        <span className="text-muted min-w-32 text-center text-sm">
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
      </div>

      {totalPages > 3 ? (
        <form onSubmit={handleJump} className="flex items-center gap-2 text-sm">
          <label htmlFor="page-jump" className="text-muted">
            برو به صفحه
          </label>
          <input
            id="page-jump"
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(event) => setJumpValue(event.target.value)}
            className="field-control page-jump-input w-20 px-2 py-1"
            dir="ltr"
            inputMode="numeric"
            disabled={disabled}
          />
          <Button type="submit" variant="secondary" disabled={disabled || !jumpValue}>
            برو
          </Button>
        </form>
      ) : null}
    </nav>
  );
}
