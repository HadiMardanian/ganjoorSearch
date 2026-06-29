import {
  BookMarked,
  BookOpen,
  ChevronLeft,
  Feather,
  FileText,
  ScrollText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Category } from '@/types/ganjoor';
import { Skeleton } from '@/components/ui/Skeleton';
import { useState } from 'react';

interface CategoryGridProps {
  title: string;
  subtitle?: string;
  categories: Category[];
  loading?: boolean;
  onSelect: (category: Category) => void;
  onBack?: () => void;
  showBack?: boolean;
}

function categoryIcon(title: string): LucideIcon {
  if (title.includes('غزل')) return Feather;
  if (title.includes('رباع')) return BookMarked;
  if (title.includes('قصید')) return ScrollText;
  if (title.includes('مثنوی') || title.includes('دیوان')) return BookOpen;
  return FileText;
}

export function CategoryGrid({
  title,
  subtitle,
  categories,
  loading,
  onSelect,
  onBack,
  showBack = true,
}: CategoryGridProps) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const showExpand = subtitle && subtitle.length >= 280;

  return (
    <section>
      <div className="mb-5">
        {onBack && showBack ? (
          <button
            type="button"
            className="text-muted hover:text-[var(--color-ink)] mb-3 inline-flex min-h-[44px] items-center gap-1 text-sm"
            onClick={onBack}
          >
            <ChevronLeft size={16} />
            بازگشت
          </button>
        ) : null}
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle ? (
          <div className="text-muted mt-2 text-sm leading-7">
            <p>{bioExpanded || !showExpand ? subtitle : `${subtitle}…`}</p>
            {showExpand ? (
              <button
                type="button"
                className="text-accent mt-1 text-xs font-medium hover:underline"
                onClick={() => setBioExpanded((open) => !open)}
              >
                {bioExpanded ? 'کمتر' : 'بیشتر بخوانید'}
              </button>
            ) : null}
          </div>
        ) : null}
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
          {categories.map((category, index) => {
            const Icon = categoryIcon(category.title);
            return (
              <button
                key={category.id}
                type="button"
                className="surface-card hover:border-[var(--color-accent)] fade-in flex min-h-[88px] items-center gap-3 rounded-2xl border p-4 text-start transition-colors"
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                onClick={() => onSelect(category)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-accent">
                  <Icon size={20} />
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
            );
          })}
        </div>
      )}
    </section>
  );
}
