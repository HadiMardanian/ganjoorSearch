import { useCallback, useEffect, useState } from 'react';
import { ArrowUp, Link2 } from 'lucide-react';
import { useCategoriesQuery, usePoetsQuery, useSearchQuery } from '@/api/queries';
import { ExportButtons } from '@/components/export/ExportButtons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ResultsList } from '@/components/results/ResultsList';
import { ActiveFiltersBadge } from '@/components/search/ActiveFiltersBadge';
import { SearchHistory } from '@/components/search/SearchHistory';
import {
  CategorySelect,
  PoetPicker,
  SearchBar,
} from '@/components/search/SearchForm';
import { Pagination } from '@/components/ui/Pagination';
import { showToast, ToastContainer } from '@/components/ui/Toast';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useSearchState } from '@/hooks/useSearchParams';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';

export default function App() {
  const { initial, urlState, updateUrl } = useSearchState();
  const { theme, setTheme } = useTheme();
  const { entries: historyEntries, addEntry, clearHistory } = useSearchHistory();

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

  const filtersDirty =
    searched &&
    (poetId !== appliedPoetId || categoryId !== appliedCategoryId || input.trim() !== searchTerm);

  useEffect(() => {
    setInput(urlState.term);
    setPoetId(urlState.poetId);
    setCategoryId(urlState.categoryId);
    setSearchTerm(urlState.term);
    setAppliedPoetId(urlState.poetId);
    setAppliedCategoryId(urlState.categoryId);
    setPage(urlState.page);
    setViewMode(urlState.viewMode);
    setSearched(Boolean(urlState.term));
  }, [urlState]);

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
  const poets = poetsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

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
    if (poetsQuery.error) {
      showToast('خطا در بارگذاری فهرست شاعران.', 'error');
    }
  }, [poetsQuery.error]);

  useEffect(() => {
    if (categoriesQuery.error && poetId !== 'all') {
      showToast('خطا در بارگذاری قالب‌های شعر.', 'error');
    }
  }, [categoriesQuery.error, poetId]);

  useEffect(() => {
    document.title = searchTerm
      ? `جستجو: ${searchTerm} — گنجورسرچ`
      : 'جستجوی اشعار فارسی';
  }, [searchTerm]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 200);
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
    addEntry({ term: trimmed, poetId, categoryId });
    syncUrl({ term: trimmed, poetId, categoryId, page: 1 });
  }

  function handlePoetChange(value: PoetFilter) {
    setPoetId(value);
    setCategoryId('all');
  }

  function applyHistoryEntry(entry: {
    term: string;
    poetId: PoetFilter;
    categoryId: CategoryFilter;
  }) {
    setInput(entry.term);
    setPoetId(entry.poetId);
    setCategoryId(entry.categoryId);
    setSearchTerm(entry.term);
    setAppliedPoetId(entry.poetId);
    setAppliedCategoryId(entry.categoryId);
    setPage(1);
    setSearched(true);
    syncUrl({
      term: entry.term,
      poetId: entry.poetId,
      categoryId: entry.categoryId,
      page: 1,
    });
  }

  async function handleCopySearchLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('لینک جستجو کپی شد.', 'success');
    } catch {
      showToast('کپی لینک ممکن نشد.', 'error');
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        پرش به محتوا
      </a>
      <Header theme={theme} onThemeChange={setTheme} />

      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <SearchBar
          value={input}
          onChange={setInput}
          onSearch={handleSearch}
          loading={searchQuery.isFetching}
          filtersDirty={filtersDirty}
          poetPicker={
            <PoetPicker
              poets={poets}
              value={poetId}
              onChange={handlePoetChange}
              disabled={poetsQuery.isLoading}
            />
          }
          categorySelect={
            <CategorySelect
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              poetSelected={poetId !== 'all'}
              loading={categoriesQuery.isFetching && poetId !== 'all'}
            />
          }
        />

        <SearchHistory
          entries={historyEntries}
          onSelect={applyHistoryEntry}
          onClear={clearHistory}
        />

        {searched ? (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ViewModeToggle
                value={viewMode}
                onChange={(mode) => {
                  setViewMode(mode);
                  syncUrl({ viewMode: mode });
                }}
              />
              <Button variant="secondary" onClick={handleCopySearchLink}>
                <Link2 size={16} />
                کپی لینک جستجو
              </Button>
            </div>

            <div className="mt-5">
              <ExportButtons
                term={searchTerm}
                poetId={appliedPoetId}
                categoryId={appliedCategoryId}
                currentPageResults={groupedResults}
                totalCount={searchQuery.data?.totalCount ?? 0}
                disabled={searchQuery.isFetching || !searchTerm}
              />
            </div>
          </>
        ) : null}

        <div className="mt-8">
          {searchQuery.isFetching && groupedResults.length === 0 && searched && (
            <p className="mb-4 text-center text-sm text-stone-600">
              در حال جستجو در گنجور…
            </p>
          )}

          {searched ? (
            <ActiveFiltersBadge
              term={searchTerm}
              poetId={appliedPoetId}
              categoryId={appliedCategoryId}
              poets={poets}
              categories={categories}
            />
          ) : null}

          <ResultsList
            results={groupedResults}
            searchTerm={searchTerm}
            viewMode={viewMode}
            loading={searchQuery.isFetching}
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
