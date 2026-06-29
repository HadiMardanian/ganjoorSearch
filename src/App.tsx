import { useEffect, useMemo, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { groupSearchResults } from '@/api/ganjoor';
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
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';

export default function App() {
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [poetId, setPoetId] = useState<PoetFilter>('all');
  const [categoryId, setCategoryId] = useState<CategoryFilter>('all');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('verse');
  const [searched, setSearched] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const poetsQuery = usePoetsQuery();
  const categoriesQuery = useCategoriesQuery(poetId);
  const searchQuery = useSearchQuery(
    searchTerm,
    poetId,
    categoryId,
    page,
    searched,
  );

  const groupedResults = useMemo(
    () => groupSearchResults(searchQuery.data?.results ?? []),
    [searchQuery.data?.results],
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
    setPage(1);
    setSearched(true);
  }

  function handlePoetChange(value: PoetFilter) {
    setPoetId(value);
    setCategoryId('all');
    if (searched && searchTerm) {
      setPage(1);
    }
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
                if (searched) setPage(1);
              }}
              disabled={poetId === 'all' || categoriesQuery.isLoading}
            />
          }
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'verse'
                ? 'bg-accent text-white'
                : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
            onClick={() => setViewMode('verse')}
          >
            نمایش بیت
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === 'full'
                ? 'bg-accent text-white'
                : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
            onClick={() => setViewMode('full')}
          >
            نمایش غزل کامل
          </button>
        </div>

        <div className="mt-5">
          <ExportButtons
            term={searchTerm}
            poetId={poetId}
            categoryId={categoryId}
            disabled={searchQuery.isFetching || !searchTerm}
          />
        </div>

        <div className="mt-8">
          <ResultsList
            results={groupedResults}
            searchTerm={searchTerm}
            viewMode={viewMode}
            loading={searchQuery.isFetching}
            searched={searched}
          />
        </div>

        {searched && (
          <Pagination
            page={page}
            hasMore={searchQuery.data?.hasMore ?? false}
            onPageChange={setPage}
            disabled={searchQuery.isFetching}
          />
        )}
      </main>

      <Footer />
      <ToastContainer />

      <button
        type="button"
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-all hover:bg-amber-700 ${
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
