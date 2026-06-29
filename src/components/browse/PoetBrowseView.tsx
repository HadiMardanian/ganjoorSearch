import { useMemo, useState } from 'react';
import { BookOpen, Bookmark, Shuffle } from 'lucide-react';
import { useCategoryDetailQuery, usePoetDetailQuery } from '@/api/queries';
import { BrowseBreadcrumb } from '@/components/poet-app/BrowseBreadcrumb';
import type { Category, PoemSummary } from '@/types/ganjoor';
import { CategoryGrid } from '@/components/browse/CategoryGrid';
import { PoemList } from '@/components/browse/PoemList';
import { PoemReader } from '@/components/browse/PoemReader';
import { QueryErrorPanel } from '@/components/ui/QueryErrorPanel';
import { showToast } from '@/components/ui/Toast';
import { activeBrowseCategoryId } from '@/hooks/useSearchParams';
import { listFavorites } from '@/utils/favorites';
import { readLastRead } from '@/utils/lastRead';
import { pickRandomPoem } from '@/utils/randomPoem';

interface PoetBrowseViewProps {
  poetId: number;
  browsePath: number[];
  poemUrl: string | null;
  poemListPage: number;
  onOpenCategory: (categoryId: number) => void;
  onNavigatePath: (pathIndex: number | null) => void;
  onOpenPoem: (poemUrl: string) => void;
  onPoemListPageChange: (page: number) => void;
  onBrowseBack: () => void;
}

export function PoetBrowseView({
  poetId,
  browsePath,
  poemUrl,
  poemListPage,
  onOpenCategory,
  onNavigatePath,
  onOpenPoem,
  onPoemListPageChange,
  onBrowseBack,
}: PoetBrowseViewProps) {
  const poetQuery = usePoetDetailQuery(poetId);
  const activeCatId = activeBrowseCategoryId(browsePath);
  const categoryQuery = useCategoryDetailQuery(activeCatId, true, activeCatId != null);
  const [randomLoading, setRandomLoading] = useState(false);

  const poetName = poetQuery.data?.poet.name ?? 'شاعر';
  const rootChildren = poetQuery.data?.rootCategory.children ?? [];
  const category = categoryQuery.data;
  const poems = category?.poems ?? [];
  const lastRead = useMemo(() => readLastRead(poetId), [poetId, poemUrl]);
  const [favoritesVersion, setFavoritesVersion] = useState(0);
  const favorites = useMemo(
    () => listFavorites(poetId),
    [poetId, poemUrl, favoritesVersion],
  );

  const childCategories = useMemo(() => {
    if (!activeCatId) return rootChildren;
    return category?.children ?? [];
  }, [activeCatId, category?.children, rootChildren]);

  const breadcrumbSegments = useMemo(() => {
    const segments = [{ id: null as number | null, title: poetName }];
    if (!activeCatId || !category) return segments;

    segments.push({ id: activeCatId, title: category.title });
    return segments;
  }, [activeCatId, category, poetName]);

  async function handleRandomPoem() {
    setRandomLoading(true);
    try {
      const result = await pickRandomPoem(poetId);
      if (!result) {
        showToast('شعر تصادفی یافت نشد.', 'info');
        return;
      }
      onOpenPoem(result.poemUrl);
    } catch {
      showToast('خطا در بارگذاری شعر تصادفی.', 'error');
    } finally {
      setRandomLoading(false);
    }
  }

  if (poemUrl) {
    return (
      <PoemReader
        poetId={poetId}
        poemUrl={poemUrl}
        poems={poems}
        categoryTitle={category?.title}
        shareSource="pwa"
        onBack={() => {
          setFavoritesVersion((v) => v + 1);
          onBrowseBack();
        }}
        onNavigate={onOpenPoem}
      />
    );
  }

  if (poetQuery.error && !poetQuery.data) {
    return (
      <QueryErrorPanel
        message="خطا در بارگذاری آثار شاعر."
        onRetry={() => poetQuery.refetch()}
        retrying={poetQuery.isFetching}
      />
    );
  }

  if (activeCatId && categoryQuery.isLoading) {
    return (
      <CategoryGrid
        title="در حال بارگذاری…"
        categories={[]}
        loading
        onSelect={() => {}}
        onBack={onBrowseBack}
      />
    );
  }

  if (activeCatId && categoryQuery.error && !category) {
    return (
      <QueryErrorPanel
        message="خطا در بارگذاری این بخش."
        onRetry={() => categoryQuery.refetch()}
        retrying={categoryQuery.isFetching}
      />
    );
  }

  const breadcrumb = (
    <BrowseBreadcrumb segments={breadcrumbSegments} onNavigate={onNavigatePath} />
  );

  if (activeCatId && category) {
    const hasChildren = childCategories.length > 0;
    const hasPoems = poems.length > 0;

    if (hasChildren || hasPoems) {
      return (
        <div>
          {breadcrumb}
          {hasChildren ? (
            <CategoryGrid
              title={category.title}
              categories={childCategories}
              onSelect={(item) => onOpenCategory(item.id)}
              onBack={onBrowseBack}
            />
          ) : null}
          {hasPoems ? (
            <div className={hasChildren ? 'mt-8' : ''}>
              {hasChildren ? (
                <h3 className="mb-3 text-lg font-bold">قطعات این بخش</h3>
              ) : null}
              <PoemList
                title={hasChildren ? '' : category.title}
                poems={poems}
                loading={categoryQuery.isLoading}
                page={poemListPage}
                onPageChange={onPoemListPageChange}
                onSelect={(poem: PoemSummary) => {
                  if (poem.fullUrl) onOpenPoem(poem.fullUrl);
                }}
                onBack={onBrowseBack}
                showBack={!hasChildren}
              />
            </div>
          ) : null}
        </div>
      );
    }
  }

  return (
    <div>
      {breadcrumb}
      {lastRead && !activeCatId ? (
        <button
          type="button"
          className="surface-card hover:border-[var(--color-accent)] fade-in mb-5 flex w-full items-center gap-3 rounded-2xl border p-4 text-start transition-colors"
          onClick={() => onOpenPoem(lastRead.poemUrl)}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-accent">
            <BookOpen size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-subtle block text-xs">ادامه مطالعه</span>
            <span className="block font-semibold">{lastRead.poemTitle}</span>
            {lastRead.categoryTitle ? (
              <span className="text-muted mt-1 block text-xs">{lastRead.categoryTitle}</span>
            ) : null}
          </span>
        </button>
      ) : null}
      {!activeCatId ? (
        <button
          type="button"
          className="surface-card hover:border-[var(--color-accent)] fade-in mb-5 flex w-full items-center gap-3 rounded-2xl border p-4 text-start transition-colors disabled:opacity-60"
          onClick={handleRandomPoem}
          disabled={randomLoading || poetQuery.isLoading}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-accent">
            <Shuffle size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-subtle block text-xs">کشف تصادفی</span>
            <span className="block font-semibold">
              {randomLoading ? 'در حال انتخاب شعر…' : 'شعر تصادفی'}
            </span>
          </span>
        </button>
      ) : null}
      {favorites.length > 0 && !activeCatId ? (
        <section className="mb-5">
          <h3 className="mb-3 text-lg font-bold">علاقه‌مندی‌ها</h3>
          <div className="space-y-3">
            {favorites.slice(0, 8).map((item) => (
              <button
                key={item.poemUrl}
                type="button"
                className="surface-card hover:border-[var(--color-accent)] fade-in flex w-full items-center gap-3 rounded-2xl border p-4 text-start transition-colors"
                onClick={() => onOpenPoem(item.poemUrl)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-accent">
                  <Bookmark size={20} className="fill-current" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{item.poemTitle}</span>
                  {item.categoryTitle ? (
                    <span className="text-muted mt-1 block text-xs">{item.categoryTitle}</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
      <CategoryGrid
        title={`آثار ${poetName}`}
        subtitle={poetQuery.data?.poet.description}
        categories={rootChildren}
        loading={poetQuery.isLoading}
        onSelect={(item: Category) => onOpenCategory(item.id)}
        showBack={false}
      />
    </div>
  );
}
