import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUp, Link2 } from 'lucide-react';
import { useCategoriesQuery, usePoetsQuery, useSearchQuery } from '@/api/queries';
import { ExportButtons } from '@/components/export/ExportButtons';
import { PoetBrowseView } from '@/components/browse/PoetBrowseView';
import { PoetInstallFlow } from '@/components/install/PoetInstallFlow';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { PoetAppShell } from '@/components/poet-app/PoetAppShell';
import type { PoetAppScreen } from '@/components/poet-app/PoetAppHeader';
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
import {
  useSearchState,
  type PoetAppTab,
  type SearchState,
} from '@/hooks/useSearchParams';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import type { CategoryFilter, Poet, PoetFilter, ViewMode } from '@/types/ganjoor';
import { injectPoetManifest } from '@/utils/poetManifest';
import { PoemReader } from '@/components/browse/PoemReader';

function syncThemeColor() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', isDark ? '#1c1917' : '#9a3412');
  }
}

export default function App() {
  const { initial, urlState, replaceUrl, pushUrl } = useSearchState();
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
  const [browsePath, setBrowsePath] = useState<number[]>(initial.browsePath);
  const [poemUrl, setPoemUrl] = useState<string | null>(initial.poemUrl);
  const [poemListPage, setPoemListPage] = useState(initial.poemListPage);
  const [searched, setSearched] = useState(Boolean(initial.term));
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [readerTitle, setReaderTitle] = useState<string | undefined>();

  const poetsQuery = usePoetsQuery();
  const poets = poetsQuery.data ?? [];
  const {
    isPoetApp,
    lockPoet,
    poet: poetAppPoet,
    saveInstalledPoet,
    clearInstalledPoet,
  } = usePoetApp(poets, urlState.poetId, urlState.source);

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
    setBrowsePath(urlState.browsePath);
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

  useEffect(() => {
    syncThemeColor();
    const observer = new MutationObserver(syncThemeColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [theme]);

  const categoriesQuery = useCategoriesQuery(poetId);
  const searchQuery = useSearchQuery(
    searchTerm,
    appliedPoetId,
    appliedCategoryId,
    page,
    searched && (!isPoetApp || appTab === 'search'),
  );

  const groupedResults = searchQuery.data?.results ?? [];
  const categories = categoriesQuery.data ?? [];

  const buildState = useCallback(
    (overrides: Partial<SearchState> = {}): SearchState => ({
      term: overrides.term ?? searchTerm,
      poetId: overrides.poetId ?? appliedPoetId,
      categoryId: overrides.categoryId ?? appliedCategoryId,
      page: overrides.page ?? page,
      viewMode: overrides.viewMode ?? viewMode,
      source: overrides.source ?? (lockPoet ? 'pwa' : urlSource),
      tab: overrides.tab ?? appTab,
      browsePath: overrides.browsePath ?? browsePath,
      poemUrl: overrides.poemUrl !== undefined ? overrides.poemUrl : poemUrl,
      poemListPage: overrides.poemListPage ?? poemListPage,
    }),
    [
      appTab,
      appliedCategoryId,
      appliedPoetId,
      browsePath,
      lockPoet,
      page,
      poemListPage,
      poemUrl,
      searchTerm,
      urlSource,
      viewMode,
    ],
  );

  const syncUrl = useCallback(
    (overrides: Partial<SearchState> = {}, push = false) => {
      const next = buildState(overrides);
      if (push) pushUrl(next);
      else replaceUrl(next);
    },
    [buildState, pushUrl, replaceUrl],
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
      if (poemUrl) {
        document.title = readerTitle
          ? `${readerTitle} — ${poetAppPoet.name}`
          : `${poetAppPoet.name} — مطالعه`;
        return;
      }
      document.title = searchTerm
        ? `جستجو: ${searchTerm} — ${poetAppPoet.name}`
        : `${poetAppPoet.name} — گنجورسرچ`;
      return;
    }

    document.title = searchTerm
      ? `جستجو: ${searchTerm} — گنجورسرچ`
      : 'جستجوی اشعار فارسی';
  }, [isPoetApp, poetAppPoet, poemUrl, readerTitle, searchTerm]);

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
    setInput('');
    setSearchTerm('');
    setSearched(false);
    setPoetId(poet.id);
    setAppliedPoetId(poet.id);
    setCategoryId('all');
    setAppliedCategoryId('all');
    setUrlSource('pwa');
    setAppTab('browse');
    setBrowsePath([]);
    setPoemUrl(null);
    setPoemListPage(1);
    syncUrl({
      poetId: poet.id,
      categoryId: 'all',
      source: 'pwa',
      tab: 'browse',
      browsePath: [],
      poemUrl: null,
      poemListPage: 1,
      term: '',
    });
  }

  function handleChangePoet() {
    clearInstalledPoet();
    setUrlSource(null);
    syncUrl({ source: null, poetId: 'all', categoryId: 'all', browsePath: [], poemUrl: null });
    setInstallOpen(true);
  }

  function handleAppTabChange(tab: PoetAppTab) {
    setAppTab(tab);
    syncUrl({ tab, poemUrl: tab === 'browse' ? null : poemUrl });
  }

  function handleOpenBrowseCategory(categoryId: number) {
    const nextPath = [...browsePath, categoryId];
    setBrowsePath(nextPath);
    setPoemUrl(null);
    setPoemListPage(1);
    setAppTab('browse');
    syncUrl(
      {
        tab: 'browse',
        browsePath: nextPath,
        poemUrl: null,
        poemListPage: 1,
      },
      true,
    );
  }

  function handleNavigatePath(pathIndex: number | null) {
    const nextPath = pathIndex == null ? [] : browsePath.slice(0, pathIndex + 1);
    setBrowsePath(nextPath);
    setPoemUrl(null);
    setPoemListPage(1);
    syncUrl({ browsePath: nextPath, poemUrl: null, poemListPage: 1 }, true);
  }

  function handleOpenPoem(url: string, title?: string) {
    setPoemUrl(url);
    setReaderTitle(title);
    setAppTab(appTab);
    syncUrl({ poemUrl: url }, true);
  }

  function handleBrowseBack() {
    if (poemUrl) {
      setPoemUrl(null);
      setReaderTitle(undefined);
      syncUrl({ poemUrl: null }, true);
      return;
    }
    if (browsePath.length > 0) {
      const nextPath = browsePath.slice(0, -1);
      setBrowsePath(nextPath);
      setPoemListPage(1);
      syncUrl({ browsePath: nextPath, poemListPage: 1 }, true);
    }
  }

  const showBrowse = isPoetApp && appTab === 'browse' && !poemUrl;
  const showSearch = !isPoetApp || (appTab === 'search' && !poemUrl);
  const showPoemReader = isPoetApp && Boolean(poemUrl) && poetAppPoet;

  const poetAppScreen: PoetAppScreen = useMemo(() => {
    if (poemUrl) return 'reader';
    if (appTab === 'search') return 'search';
    if (browsePath.length > 0) return 'category';
    return 'home';
  }, [appTab, browsePath.length, poemUrl]);

  const searchSection = (
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
          <p className="text-muted mb-4 text-center text-sm">در حال جستجو در گنجور…</p>
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
          onOpenPoem={
            isPoetApp
              ? (result) => {
                  if (result.fullUrl) {
                    handleOpenPoem(result.fullUrl, result.poemTitle);
                  }
                }
              : undefined
          }
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
  );

  if (isPoetApp && poetAppPoet) {
    return (
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:surface-card focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:shadow-lg"
        >
          پرش به محتوا
        </a>
        <PoetAppShell
          poet={poetAppPoet}
          theme={theme}
          onThemeChange={setTheme}
          activeTab={appTab}
          onTabChange={handleAppTabChange}
          screen={poetAppScreen}
          headerTitle={readerTitle}
          onChangePoet={handleChangePoet}
          hideBottomNav={Boolean(poemUrl)}
        >
          {showPoemReader && poemUrl ? (
            <PoemReader
              poetId={poetAppPoet.id}
              poemUrl={poemUrl}
              onBack={handleBrowseBack}
            />
          ) : null}

          {showBrowse ? (
            <PoetBrowseView
              poetId={poetAppPoet.id}
              browsePath={browsePath}
              poemUrl={null}
              poemListPage={poemListPage}
              onOpenCategory={handleOpenBrowseCategory}
              onNavigatePath={handleNavigatePath}
              onOpenPoem={(url) => handleOpenPoem(url)}
              onPoemListPageChange={(nextPage) => {
                setPoemListPage(nextPage);
                syncUrl({ poemListPage: nextPage });
              }}
              onBrowseBack={handleBrowseBack}
            />
          ) : null}

          {showSearch ? searchSection : null}
        </PoetAppShell>

        <ToastContainer />
        <PoetInstallFlow
          open={installOpen}
          poets={poets}
          poetsLoading={poetsQuery.isLoading}
          initialPoetId={poetAppPoet?.id}
          onClose={() => setInstallOpen(false)}
          onPoetInstalled={handlePoetInstalled}
        />
      </>
    );
  }

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
        showInstallCta={showInstallCta}
        onInstallClick={() => setInstallOpen(true)}
      />

      <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {searchSection}
      </main>

      <Footer />
      <ToastContainer />

      <PoetInstallFlow
        open={installOpen}
        poets={poets}
        poetsLoading={poetsQuery.isLoading}
        onClose={() => setInstallOpen(false)}
        onPoetInstalled={handlePoetInstalled}
      />

      <button
        type="button"
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-lg transition-all hover:bg-[var(--color-accent-hover)] pb-safe ${
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
