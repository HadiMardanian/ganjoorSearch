import type { Category, Poet, CategoryFilter, PoetFilter } from '@/types/ganjoor';
import { isAllFilter } from '@/utils/filterState';

interface ActiveFiltersBadgeProps {
  term: string;
  poetId: PoetFilter;
  categoryId: CategoryFilter;
  poets: Poet[];
  categories: Category[];
}

export function ActiveFiltersBadge({
  term,
  poetId,
  categoryId,
  poets,
  categories,
}: ActiveFiltersBadgeProps) {
  if (!term.trim()) return null;

  const parts = [term.trim()];

  if (!isAllFilter(poetId)) {
    const poetNames = poetId
      .map((id) => poets.find((item) => item.id === id)?.name)
      .filter(Boolean);
    if (poetNames.length > 0) parts.push(poetNames.join('، '));
  }

  if (!isAllFilter(categoryId)) {
    const catNames = categoryId
      .map((id) => categories.find((item) => item.id === id)?.title)
      .filter(Boolean);
    if (catNames.length > 0) parts.push(catNames.join('، '));
  }

  return (
    <p className="text-muted mb-4 text-center text-sm" aria-label="فیلترهای فعال">
      <span className="surface-muted text-muted rounded-full px-3 py-1">
        {parts.join(' · ')}
      </span>
    </p>
  );
}
