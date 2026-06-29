import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Poet } from '@/types/ganjoor';
import { PoetAvatar } from '@/components/install/PoetAvatar';
import { Button } from '@/components/ui/Button';

type SortMode = 'popular' | 'alpha';

interface PoetInstallGalleryProps {
  poets: Poet[];
  loading?: boolean;
  onSelect: (poet: Poet) => void;
  onClose: () => void;
}

const POPULAR_POET_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

export function PoetInstallGallery({
  poets,
  loading,
  onSelect,
  onClose,
}: PoetInstallGalleryProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('popular');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let list = poets;
    if (normalized) {
      list = poets.filter((poet) =>
        (poet.name || poet.fullName || '').toLowerCase().includes(normalized),
      );
    }

    if (sort === 'alpha') {
      return [...list].sort((a, b) =>
        (a.name || a.fullName || '').localeCompare(b.name || b.fullName || '', 'fa'),
      );
    }

    return [...list].sort((a, b) => {
      const aRank = POPULAR_POET_IDS.indexOf(a.id);
      const bRank = POPULAR_POET_IDS.indexOf(b.id);
      const aScore = aRank === -1 ? 999 + a.id : aRank;
      const bScore = bRank === -1 ? 999 + b.id : bRank;
      return aScore - bScore;
    });
  }, [poets, query, sort]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-xl font-bold">انتخاب شاعر</h2>
          <p className="text-muted mt-1 text-sm">
            شاعر دلخواهتان را برای نصب اپ اختصاصی انتخاب کنید
          </p>
        </div>
        <button
          type="button"
          className="text-muted hover:text-[var(--color-ink)] rounded-lg p-2"
          onClick={onClose}
          aria-label="بستن"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="text-subtle pointer-events-none absolute start-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="search"
            className="field-control w-full py-2.5 ps-9 pe-3 text-sm"
            placeholder="جستجوی نام شاعر…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            dir="rtl"
            aria-label="جستجوی شاعر"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={sort === 'popular' ? 'primary' : 'secondary'}
            className="px-3 py-2 text-xs"
            onClick={() => setSort('popular')}
          >
            محبوب
          </Button>
          <Button
            type="button"
            variant={sort === 'alpha' ? 'primary' : 'secondary'}
            className="px-3 py-2 text-xs"
            onClick={() => setSort('alpha')}
          >
            الفبا
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {loading ? (
          <p className="text-muted py-12 text-center text-sm">در حال بارگذاری شاعران…</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted py-12 text-center text-sm">شاعری یافت نشد</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((poet) => (
              <button
                key={poet.id}
                type="button"
                className="surface-card hover:border-[var(--color-accent)] flex min-h-[120px] flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors"
                onClick={() => onSelect(poet)}
              >
                <PoetAvatar poet={poet} size="md" />
                <span className="line-clamp-2 text-sm font-semibold">
                  {poet.name || poet.fullName}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
