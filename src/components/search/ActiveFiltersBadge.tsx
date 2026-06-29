import type { Category, Poet, CategoryFilter, PoetFilter } from '@/types/ganjoor';

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

  if (poetId !== 'all') {
    const poet = poets.find((item) => item.id === poetId);
    parts.push(poet?.name || poet?.fullName || 'شاعر');
  }

  if (categoryId !== 'all') {
    const category = categories.find((item) => item.id === categoryId);
    parts.push(category?.title || 'قالب');
  }

  return (
    <p className="text-muted mb-4 text-center text-sm" aria-label="فیلترهای فعال">
      <span className="surface-muted text-muted rounded-full px-3 py-1">
        {parts.join(' · ')}
      </span>
    </p>
  );
}
