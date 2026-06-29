import { useMemo } from 'react';
import { useCategoryDetailQuery, usePoetDetailQuery } from '@/api/queries';
import type { Category, PoemSummary } from '@/types/ganjoor';
import { CategoryGrid } from '@/components/browse/CategoryGrid';
import { PoemList } from '@/components/browse/PoemList';
import { PoemReader } from '@/components/browse/PoemReader';

interface PoetBrowseViewProps {
  poetId: number;
  browseCatId: number | null;
  poemUrl: string | null;
  poemListPage: number;
  onOpenCategory: (categoryId: number) => void;
  onOpenPoem: (poemUrl: string) => void;
  onPoemListPageChange: (page: number) => void;
  onBrowseHome: () => void;
  onBrowseBack: () => void;
}

export function PoetBrowseView({
  poetId,
  browseCatId,
  poemUrl,
  poemListPage,
  onOpenCategory,
  onOpenPoem,
  onPoemListPageChange,
  onBrowseHome,
  onBrowseBack,
}: PoetBrowseViewProps) {
  const poetQuery = usePoetDetailQuery(poetId);
  const categoryQuery = useCategoryDetailQuery(browseCatId, true, browseCatId != null);

  const poetName = poetQuery.data?.poet.name ?? 'شاعر';
  const rootChildren = poetQuery.data?.rootCategory.children ?? [];
  const category = categoryQuery.data;
  const poems = category?.poems ?? [];

  const childCategories = useMemo(() => {
    if (!browseCatId) return rootChildren;
    return category?.children ?? [];
  }, [browseCatId, category?.children, rootChildren]);

  if (poemUrl) {
    return (
      <PoemReader
        poemUrl={poemUrl}
        poems={poems}
        onBack={onBrowseBack}
        onNavigate={onOpenPoem}
      />
    );
  }

  if (browseCatId && categoryQuery.isLoading) {
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

  if (browseCatId && category) {
    if (childCategories.length > 0) {
      return (
        <CategoryGrid
          title={category.title}
          categories={childCategories}
          onSelect={(item) => onOpenCategory(item.id)}
          onBack={onBrowseBack}
        />
      );
    }

    return (
      <PoemList
        title={category.title}
        poems={poems}
        loading={categoryQuery.isLoading}
        page={poemListPage}
        onPageChange={onPoemListPageChange}
        onSelect={(poem: PoemSummary) => {
          if (poem.fullUrl) onOpenPoem(poem.fullUrl);
        }}
        onBack={onBrowseBack}
      />
    );
  }

  return (
    <CategoryGrid
      title={`آثار ${poetName}`}
      subtitle={poetQuery.data?.poet.description?.slice(0, 280)}
      categories={rootChildren}
      loading={poetQuery.isLoading}
      onSelect={(item: Category) => onOpenCategory(item.id)}
      onBack={browseCatId ? onBrowseHome : undefined}
    />
  );
}
