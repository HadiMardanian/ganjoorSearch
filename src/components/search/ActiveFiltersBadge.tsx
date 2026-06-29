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
    <p className="mb-4 text-center text-sm text-stone-600" aria-label="فیلترهای فعال">
      <span className="rounded-full bg-stone-100 px-3 py-1">{parts.join(' · ')}</span>
    </p>
  );
}
