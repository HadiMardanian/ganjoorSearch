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
  browsePath: number[];
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
  browsePath: [],
  poemUrl: null,
  poemListPage: 1,
};

export function parseBrowsePath(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split('/')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export function formatBrowsePath(path: number[]): string | null {
  if (path.length === 0) return null;
  return path.join('/');
}

function readFromUrl(): SearchState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  const params = new URLSearchParams(window.location.search);

  const poet = params.get('poet');
  const cat = params.get('cat');
  const page = Number(params.get('page') ?? '1');
  const mode = params.get('mode');
  const poemListPage = Number(params.get('plist') ?? '1');

  const poetNum = poet ? Number(poet) : NaN;
  const catNum = cat ? Number(cat) : NaN;

  const sourceParam = params.get('source');
  const tabParam = params.get('tab');
  const term = params.get('q') ?? '';

  const tab: PoetAppTab =
    tabParam === 'search' || (term && tabParam !== 'browse') ? 'search' : 'browse';

  let browsePath = parseBrowsePath(params.get('bpath'));
  if (browsePath.length === 0) {
    const legacyBcat = params.get('bcat');
    if (legacyBcat) {
      const id = Number(legacyBcat);
      if (Number.isFinite(id) && id > 0) browsePath = [id];
    }
  }

  return {
    term,
    poetId: poet && poet !== 'all' && Number.isFinite(poetNum) ? poetNum : 'all',
    categoryId:
      cat && cat !== 'all' && Number.isFinite(catNum) ? catNum : 'all',
    page: Number.isFinite(page) && page > 0 ? page : 1,
    viewMode: mode === 'full' ? 'full' : 'verse',
    source: sourceParam === 'pwa' ? 'pwa' : null,
    tab,
    browsePath,
    poemUrl: params.get('poem'),
    poemListPage:
      Number.isFinite(poemListPage) && poemListPage > 0 ? poemListPage : 1,
  };
}

function buildUrl(state: SearchState): string {
  const params = new URLSearchParams();

  if (state.term) params.set('q', state.term);
  if (state.poetId !== 'all') params.set('poet', String(state.poetId));
  if (state.categoryId !== 'all') params.set('cat', String(state.categoryId));
  if (state.page > 1) params.set('page', String(state.page));
  if (state.viewMode !== 'verse') params.set('mode', state.viewMode);
  if (state.source === 'pwa') params.set('source', 'pwa');
  if (state.tab === 'search') params.set('tab', 'search');
  if (state.tab === 'browse' && state.source === 'pwa') params.set('tab', 'browse');

  const bpath = formatBrowsePath(state.browsePath);
  if (bpath) params.set('bpath', bpath);

  if (state.poemUrl) params.set('poem', state.poemUrl);
  if (state.poemListPage > 1) params.set('plist', String(state.poemListPage));

  const query = params.toString();
  return query ? `${window.location.pathname}?${query}` : window.location.pathname;
}

function writeToUrl(state: SearchState, push = false) {
  const next = buildUrl(state);
  const current = `${window.location.pathname}${window.location.search}`;

  if (push && next !== current) {
    window.history.pushState(null, '', next);
  } else {
    window.history.replaceState(null, '', next);
  }
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

  const replaceUrl = useCallback((state: SearchState) => {
    writeToUrl(state, false);
    setUrlState(state);
  }, []);

  const pushUrl = useCallback((state: SearchState) => {
    writeToUrl(state, true);
    setUrlState(state);
  }, []);

  const updateUrl = replaceUrl;

  return { initial: urlState, urlState, updateUrl, replaceUrl, pushUrl };
}

export function buildSearchState(
  partial: Partial<SearchState> & Pick<SearchState, 'term'>,
): SearchState {
  return {
    ...DEFAULT_STATE,
    ...partial,
  };
}

export function activeBrowseCategoryId(path: number[]): number | null {
  if (path.length === 0) return null;
  return path[path.length - 1] ?? null;
}
