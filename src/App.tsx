import { useCallback, useEffect, useState } from 'react';
import { ArrowUp, Link2, RefreshCw } from 'lucide-react';
import { useCategoriesQuery, usePoetsQuery, useSearchQuery } from '@/api/queries';
import { ExportButtons } from '@/components/export/ExportButtons';
import { PoetBrowseView } from '@/components/browse/PoetBrowseView';
import { PoetAppTabs } from '@/components/browse/PoetAppTabs';
import { PoetInstallFlow } from '@/components/install/PoetInstallFlow';
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
import { usePoetApp } from '@/hooks/usePoetApp';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useSearchState, type PoetAppTab } from '@/hooks/useSearchParams';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import type { CategoryFilter, Poet, PoetFilter, ViewMode } from '@/types/ganjoor';
import { injectPoetManifest } from '@/utils/poetManifest';

export default function App() {
  const { initial, urlState, updateUrl } = useSearchState();
  const { theme, setTheme } = useTheme();
  const { entries: historyEntries, addEntry, clearHistory } = useSearchHistory();
  const { showInstallCta } = usePwaInstall();

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
  const [urlSource, setUrlSource] = useState<'pwa' | null>(initial.source);
  const [appTab, setAppTab] = useState<PoetAppTab>(initial.tab);
  const [browseCatId, setBrowseCatId] = useState<number | null>(initial.browseCatId);
  const [poemUrl, setPoemUrl] = useState<string | null>(initial.poemUrl);
  const [poemListPage, setPoemListPage] = useState(initial.poemListPage);
  const [searched, setSearched] = useState(Boolean(initial.term));
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);

  const poetsQuery = usePoetsQuery();
  const poets = poetsQuery.data ?? [];
  const {
    isPoetApp,
    lockPoet,
    poet: poetAppPoet,
    saveInstalledPoet,
    clearInstalledPoet,
  } = usePoetApp(poets);

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
    setUrlSource(urlState.source);
    setAppTab(urlState.tab);
    setBrowseCatId(urlState.browseCatId);
    setPoemUrl(urlState.poemUrl);
    setPoemListPage(urlState.poemListPage);
    setSearched(Boolean(urlState.term));
  }, [urlState]);

  useEffect(() => {
    if (!isPoetApp || !poetAppPoet) return;
    if (poetId === poetAppPoet.id) return;
    setPoetId(poetAppPoet.id);
    setAppliedPoetId(poetAppPoet.id);
    setCategoryId('all');
    setAppliedCategoryId('all');
  }, [isPoetApp, poetAppPoet, poetId]);

  useEffect(() => {
    if (!poetAppPoet || !lockPoet) return;
    injectPoetManifest(poetAppPoet).catch(() => {});
  }, [poetAppPoet, lockPoet]);

  const categoriesQuery = useCategoriesQuery(poetId);
  const searchQuery = useSearchQuery(
    searchTerm,
    appliedPoetId,
    appliedCategoryId,
    page,
    searched,
  );

  const groupedResults = searchQuery.data?.results ?? [];
  const categories = categoriesQuery.data ?? [];

  const syncUrl = useCallback(
    (overrides: Partial<{
      term: string;
      poetId: PoetFilter;
      categoryId: CategoryFilter;
      page: number;
      viewMode: ViewMode;
      source: 'pwa' | null;
      tab: PoetAppTab;
      browseCatId: number | null;
      poemUrl: string | null;
      poemListPage: number;
    }> = {}) => {
      updateUrl({
        term: overrides.term ?? searchTerm,
        poetId: overrides.poetId ?? appliedPoetId,
        categoryId: overrides.categoryId ?? appliedCategoryId,
        page: overrides.page ?? page,
        viewMode: overrides.viewMode ?? viewMode,
        source: overrides.source ?? (lockPoet ? 'pwa' : urlSource),
        tab: overrides.tab ?? appTab,
        browseCatId:
          overrides.browseCatId !== undefined ? overrides.browseCatId : browseCatId,
        poemUrl: overrides.poemUrl !== undefined ? overrides.poemUrl : poemUrl,
        poemListPage: overrides.poemListPage ?? poemListPage,
      });
    },
    [
      appTab,
      appliedCategoryId,
      appliedPoetId,
      browseCatId,
      lockPoet,
      page,
      poemListPage,
      poemUrl,
      searchTerm,
      updateUrl,
      urlSource,
      viewMode,
    ],
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
    if (isPoetApp && poetAppPoet) {
      document.title = searchTerm
        ? `جستجو: ${searchTerm} — ${poetAppPoet.name}`
        : `${poetAppPoet.name} — گنجورسرچ`;
      return;
    }

    document.title = searchTerm
      ? `جستجو: ${searchTerm} — گنجورسرچ`
      : 'جستجوی اشعار فارسی';
  }, [isPoetApp, poetAppPoet, searchTerm]);

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
    setAppTab('search');
    addEntry({ term: trimmed, poetId, categoryId });
    syncUrl({
      term: trimmed,
      poetId,
      categoryId,
      page: 1,
      tab: 'search',
      poemUrl: null,
    });
  }

  function handlePoetChange(value: PoetFilter) {
    if (lockPoet) return;
    setPoetId(value);
    setCategoryId('all');
  }

  function applyHistoryEntry(entry: {
    term: string;
    poetId: PoetFilter;
    categoryId: CategoryFilter;
  }) {
    if (lockPoet && poetAppPoet && entry.poetId !== poetAppPoet.id) {
      showToast(`در اپ ${poetAppPoet.name} فقط همان شاعر قابل جستجو است.`, 'info');
      return;
    }

    setInput(entry.term);
    setPoetId(entry.poetId);
    setCategoryId(entry.categoryId);
    setSearchTerm(entry.term);
    setAppliedPoetId(entry.poetId);
    setAppliedCategoryId(entry.categoryId);
    setPage(1);
    setSearched(true);
    setAppTab('search');
    syncUrl({
      term: entry.term,
      poetId: entry.poetId,
      categoryId: entry.categoryId,
      page: 1,
      tab: 'search',
      poemUrl: null,
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

  function handlePoetInstalled(poet: Poet) {
    saveInstalledPoet({
      id: poet.id,
      name: poet.name || poet.fullName || 'شاعر',
      imageUrl: poet.imageUrl,
    });
    setPoetId(poet.id);
    setAppliedPoetId(poet.id);
    setCategoryId('all');
    setAppliedCategoryId('all');
    setUrlSource('pwa');
    setAppTab('browse');
    setBrowseCatId(null);
    setPoemUrl(null);
    setPoemListPage(1);
    syncUrl({
      poetId: poet.id,
      categoryId: 'all',
      source: 'pwa',
      tab: 'browse',
      browseCatId: null,
      poemUrl: null,
      poemListPage: 1,
      term: '',
    });
  }

  function handleChangePoet() {
    clearInstalledPoet();
    setUrlSource(null);
    syncUrl({ source: null, poetId: 'all', categoryId: 'all' });
    setInstallOpen(true);
  }

  function handleAppTabChange(tab: PoetAppTab) {
    setAppTab(tab);
    if (tab === 'browse') {
      setSearched(false);
      setSearchTerm('');
      setInput('');
      syncUrl({
        tab: 'browse',
        term: '',
        poemUrl: null,
        browseCatId,
        page: 1,
      });
      return;
    }
    syncUrl({ tab: 'search' });
  }

  function handleOpenBrowseCategory(categoryId: number) {
    setBrowseCatId(categoryId);
    setPoemUrl(null);
    setPoemListPage(1);
    setAppTab('browse');
    syncUrl({
      tab: 'browse',
      browseCatId: categoryId,
      poemUrl: null,
      poemListPage: 1,
    });
  }

  function handleOpenPoem(url: string) {
    setPoemUrl(url);
    setAppTab('browse');
    syncUrl({ tab: 'browse', poemUrl: url });
  }

  function handleBrowseHome() {
    setBrowseCatId(null);
    setPoemUrl(null);
    setPoemListPage(1);
    syncUrl({ browseCatId: null, poemUrl: null, poemListPage: 1 });
  }

  function handleBrowseBack() {
    if (poemUrl) {
      setPoemUrl(null);
      syncUrl({ poemUrl: null });
      return;
    }
    if (browseCatId) {
      setBrowseCatId(null);
      setPoemListPage(1);
      syncUrl({ browseCatId: null, poemListPage: 1 });
    }
  }

  const showBrowse = isPoetApp && appTab === 'browse';
  const showSearch = !isPoetApp || appTab === 'search';

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:surface-card focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:shadow-lg"
      >
        پرش به محتوا
      </a>
      <Header
        theme={theme}
        onThemeChange={setTheme}
        poetApp={isPoetApp ? poetAppPoet : null}
        showInstallCta={showInstallCta && !isPoetApp}
        onInstallClick={() => setInstallOpen(true)}
      />

      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {lockPoet && poetAppPoet ? (
          <div className="mb-4 flex justify-end">
            <Button type="button" variant="ghost" className="text-sm" onClick={handleChangePoet}>
              <RefreshCw size={16} />
              تغییر شاعر / نصب شاعر دیگر
            </Button>
          </div>
        ) : null}

        {isPoetApp ? (
          <PoetAppTabs activeTab={appTab} onChange={handleAppTabChange} />
        ) : null}

        {showBrowse && poetAppPoet ? (
          <PoetBrowseView
            poetId={poetAppPoet.id}
            browseCatId={browseCatId}
            poemUrl={poemUrl}
            poemListPage={poemListPage}
            onOpenCategory={handleOpenBrowseCategory}
            onOpenPoem={handleOpenPoem}
            onPoemListPageChange={(nextPage) => {
              setPoemListPage(nextPage);
              syncUrl({ poemListPage: nextPage });
            }}
            onBrowseHome={handleBrowseHome}
            onBrowseBack={handleBrowseBack}
          />
        ) : null}

        {showSearch ? (
          <>
        <SearchBar
          value={input}
          onChange={setInput}
          onSearch={handleSearch}
          loading={searchQuery.isFetching}
          filtersDirty={filtersDirty}
          poetPicker={
            lockPoet ? null : (
              <PoetPicker
                poets={poets}
                value={poetId}
                onChange={handlePoetChange}
                disabled={poetsQuery.isLoading}
              />
            )
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
            <p className="text-muted mb-4 text-center text-sm">
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
          </>
        ) : null}
      </main>

      <Footer />
      <ToastContainer />

      <PoetInstallFlow
        open={installOpen}
        poets={poets}
        poetsLoading={poetsQuery.isLoading}
        initialPoetId={poetAppPoet?.id}
        onClose={() => setInstallOpen(false)}
        onPoetInstalled={handlePoetInstalled}
      />

      <button
        type="button"
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg transition-all hover:bg-[var(--color-accent-hover)] ${
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
