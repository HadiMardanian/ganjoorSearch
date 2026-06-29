import { useCallback, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useCategoriesQuery, usePoetsQuery, useSearchQuery } from '@/api/queries';
import { ExportButtons } from '@/components/export/ExportButtons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ResultsList } from '@/components/results/ResultsList';
import {
  CategorySelect,
  PoetPicker,
  SearchBar,
} from '@/components/search/SearchForm';
import { Pagination } from '@/components/ui/Pagination';
import { showToast, ToastContainer } from '@/components/ui/Toast';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { useSearchState } from '@/hooks/useSearchParams';
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';

export default function App() {
  const { initial, updateUrl } = useSearchState();

  const [input, setInput] = useState(initial.term);
  const [poetId, setPoetId] = useState<PoetFilter>(initial.poetId);
  const [categoryId, setCategoryId] = useState<CategoryFilter>(initial.categoryId);
  const [searchTerm, setSearchTerm] = useState(initial.term);
  const [appliedPoetId, setAppliedPoetId] = useState<PoetFilter>(initial.poetId);
  const [appliedCategoryId, setAppliedCategoryId] = useState<CategoryFilter>(
    initial.categoryId,
  );
  const [page, setPage] = useState(initial.page);
  const [viewMode, setViewMode] = useState<ViewMode>(initial.viewMode);
  const [searched, setSearched] = useState(Boolean(initial.term));
  const [showScrollTop, setShowScrollTop] = useState(false);

  const poetsQuery = usePoetsQuery();
  const categoriesQuery = useCategoriesQuery(poetId);
  const searchQuery = useSearchQuery(
    searchTerm,
    appliedPoetId,
    appliedCategoryId,
    page,
    searched,
  );

  const groupedResults = searchQuery.data?.results ?? [];

  const syncUrl = useCallback(
    (overrides: Partial<{
      term: string;
      poetId: PoetFilter;
      categoryId: CategoryFilter;
      page: number;
      viewMode: ViewMode;
    }> = {}) => {
      updateUrl({
        term: overrides.term ?? searchTerm,
        poetId: overrides.poetId ?? appliedPoetId,
        categoryId: overrides.categoryId ?? appliedCategoryId,
        page: overrides.page ?? page,
        viewMode: overrides.viewMode ?? viewMode,
      });
    },
    [appliedCategoryId, appliedPoetId, page, searchTerm, updateUrl, viewMode],
  );

  useEffect(() => {
    if (searchQuery.error) {
      const message =
        searchQuery.error instanceof Error
          ? searchQuery.error.message
          : 'خطا در جستجو';
      showToast(message, 'error');
    }
  }, [searchQuery.error]);

  useEffect(() => {
    function handleScroll() {
      const nearTop = window.scrollY <= 200;
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;
      setShowScrollTop(!nearTop && !nearBottom);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleSearch() {
    const trimmed = input.trim();
    if (!trimmed) {
      showToast('لطفاً یک کلمه برای جستجو وارد کنید.', 'info');
      return;
    }

    setSearchTerm(trimmed);
    setAppliedPoetId(poetId);
    setAppliedCategoryId(categoryId);
    setPage(1);
    setSearched(true);
    syncUrl({ term: trimmed, poetId, categoryId, page: 1 });
  }

  function handlePoetChange(value: PoetFilter) {
    setPoetId(value);
    setCategoryId('all');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <SearchBar
          value={input}
          onChange={setInput}
          onSearch={handleSearch}
          loading={searchQuery.isFetching}
          poetPicker={
            <PoetPicker
              poets={poetsQuery.data ?? []}
              value={poetId}
              onChange={handlePoetChange}
              disabled={poetsQuery.isLoading}
            />
          }
          categorySelect={
            <CategorySelect
              categories={categoriesQuery.data ?? []}
              value={categoryId}
              onChange={(value) => {
                setCategoryId(value);
              }}
              poetSelected={poetId !== 'all'}
            />
          }
        />

        <div className="mt-6 flex justify-center">
          <ViewModeToggle
            value={viewMode}
            onChange={(mode) => {
              setViewMode(mode);
              syncUrl({ viewMode: mode });
            }}
          />
        </div>

        <div className="mt-5">
          <ExportButtons
            term={searchTerm}
            poetId={appliedPoetId}
            categoryId={appliedCategoryId}
            totalCount={searchQuery.data?.totalCount ?? 0}
            disabled={searchQuery.isFetching || !searchTerm}
          />
        </div>

        <div className="mt-8">
          {searchQuery.isFetching && groupedResults.length === 0 && searched && (
            <p className="mb-4 text-center text-sm text-stone-600">
              در حال جستجو در گنجور…
            </p>
          )}
          <ResultsList
            results={groupedResults}
            searchTerm={searchTerm}
            viewMode={viewMode}
            loading={searchQuery.isLoading}
            isFetching={searchQuery.isFetching}
            searched={searched}
            page={page}
            pageSize={searchQuery.data?.pageSize ?? 20}
            totalCount={searchQuery.data?.totalCount ?? 0}
            totalPages={searchQuery.data?.totalPages ?? 0}
          />
        </div>

        {searched && (
          <Pagination
            page={page}
            hasMore={searchQuery.data?.hasMore ?? false}
            totalPages={searchQuery.data?.totalPages ?? 0}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              syncUrl({ page: nextPage });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={searchQuery.isFetching}
          />
        )}
      </main>

      <Footer />
      <ToastContainer />

      <button
        type="button"
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#9a3412] text-white shadow-lg transition-all hover:bg-[#7c2d12] ${
          showScrollTop ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="بازگشت به ابتدای صفحه"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
