import { ChevronLeft, FolderOpen } from 'lucide-react';
import type { Category } from '@/types/ganjoor';
import { Skeleton } from '@/components/ui/Skeleton';

interface CategoryGridProps {
  title: string;
  subtitle?: string;
  categories: Category[];
  loading?: boolean;
  onSelect: (category: Category) => void;
  onBack?: () => void;
}

export function CategoryGrid({
  title,
  subtitle,
  categories,
  loading,
  onSelect,
  onBack,
}: CategoryGridProps) {
  return (
    <section>
      <div className="mb-5">
        {onBack ? (
          <button
            type="button"
            className="text-muted hover:text-[var(--color-ink)] mb-3 inline-flex items-center gap-1 text-sm"
            onClick={onBack}
          >
            <ChevronLeft size={16} />
            بازگشت
          </button>
        ) : null}
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle ? <p className="text-muted mt-2 text-sm leading-7">{subtitle}</p> : null}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-muted py-8 text-center text-sm">بخشی برای نمایش نیست.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="surface-card hover:border-[var(--color-accent)] flex min-h-[88px] items-center gap-3 rounded-2xl border p-4 text-right transition-colors"
              onClick={() => onSelect(category)}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-accent">
                <FolderOpen size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{category.title}</span>
                {category.poemCount != null && category.poemCount > 0 ? (
                  <span className="text-muted mt-1 block text-xs">
                    {category.poemCount.toLocaleString('fa-IR')} قطعه
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
