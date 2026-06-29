import { useCallback, useEffect, useState } from 'react';
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';

export type PoetAppTab = 'browse' | 'search';

export interface SearchState {
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
}

const DEFAULT_STATE: SearchState = {
  term: '',
  poetId: 'all',
  categoryId: 'all',
  page: 1,
  viewMode: 'verse',
  source: null,
  tab: 'browse',
  browseCatId: null,
  poemUrl: null,
  poemListPage: 1,
};

function readFromUrl(): SearchState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  const params = new URLSearchParams(window.location.search);

  const poet = params.get('poet');
  const cat = params.get('cat');
  const page = Number(params.get('page') ?? '1');
  const mode = params.get('mode');
  const browseCat = params.get('bcat');
  const poemListPage = Number(params.get('plist') ?? '1');

  const poetNum = poet ? Number(poet) : NaN;
  const catNum = cat ? Number(cat) : NaN;
  const browseCatNum = browseCat ? Number(browseCat) : NaN;

  const sourceParam = params.get('source');
  const tabParam = params.get('tab');
  const term = params.get('q') ?? '';

  const tab: PoetAppTab =
    tabParam === 'search' || term ? 'search' : 'browse';

  return {
    term,
    poetId: poet && poet !== 'all' && Number.isFinite(poetNum) ? poetNum : 'all',
    categoryId:
      cat && cat !== 'all' && Number.isFinite(catNum) ? catNum : 'all',
    page: Number.isFinite(page) && page > 0 ? page : 1,
    viewMode: mode === 'full' ? 'full' : 'verse',
    source: sourceParam === 'pwa' ? 'pwa' : null,
    tab,
    browseCatId:
      browseCat && Number.isFinite(browseCatNum) ? browseCatNum : null,
    poemUrl: params.get('poem'),
    poemListPage:
      Number.isFinite(poemListPage) && poemListPage > 0 ? poemListPage : 1,
  };
}

function writeToUrl(state: SearchState) {
  const params = new URLSearchParams();

  if (state.term) params.set('q', state.term);
  if (state.poetId !== 'all') params.set('poet', String(state.poetId));
  if (state.categoryId !== 'all') params.set('cat', String(state.categoryId));
  if (state.page > 1) params.set('page', String(state.page));
  if (state.viewMode !== 'verse') params.set('mode', state.viewMode);
  if (state.source === 'pwa') params.set('source', 'pwa');
  if (state.tab === 'search') params.set('tab', 'search');
  if (state.browseCatId != null) params.set('bcat', String(state.browseCatId));
  if (state.poemUrl) params.set('poem', state.poemUrl);
  if (state.poemListPage > 1) params.set('plist', String(state.poemListPage));

  const query = params.toString();
  const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, '', next);
}

export function useSearchState() {
  const [urlState, setUrlState] = useState(() => readFromUrl());

  useEffect(() => {
    function handlePopState() {
      setUrlState(readFromUrl());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = useCallback((state: SearchState) => {
    writeToUrl(state);
    setUrlState(state);
  }, []);

  return { initial: urlState, urlState, updateUrl };
}

export function buildSearchState(
  partial: Partial<SearchState> & Pick<SearchState, 'term'>,
): SearchState {
  return {
    ...DEFAULT_STATE,
    ...partial,
  };
}
