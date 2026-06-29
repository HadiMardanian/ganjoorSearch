import { useCallback, useMemo } from 'react';
import type { CategoryFilter, PoetFilter, ViewMode } from '@/types/ganjoor';

export interface SearchState {
  term: string;
  poetId: PoetFilter;
  categoryId: CategoryFilter;
  page: number;
  viewMode: ViewMode;
}

const DEFAULT_STATE: SearchState = {
  term: '',
  poetId: 'all',
  categoryId: 'all',
  page: 1,
  viewMode: 'verse',
};

function readFromUrl(): SearchState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  const params = new URLSearchParams(window.location.search);

  const poet = params.get('poet');
  const cat = params.get('cat');
  const page = Number(params.get('page') ?? '1');
  const mode = params.get('mode');

  const poetNum = poet ? Number(poet) : NaN;
  const catNum = cat ? Number(cat) : NaN;

  return {
    term: params.get('q') ?? '',
    poetId: poet && poet !== 'all' && Number.isFinite(poetNum) ? poetNum : 'all',
    categoryId:
      cat && cat !== 'all' && Number.isFinite(catNum) ? catNum : 'all',
    page: Number.isFinite(page) && page > 0 ? page : 1,
    viewMode: mode === 'full' ? 'full' : 'verse',
  };
}

function writeToUrl(state: SearchState) {
  const params = new URLSearchParams();

  if (state.term) params.set('q', state.term);
  if (state.poetId !== 'all') params.set('poet', String(state.poetId));
  if (state.categoryId !== 'all') params.set('cat', String(state.categoryId));
  if (state.page > 1) params.set('page', String(state.page));
  if (state.viewMode !== 'verse') params.set('mode', state.viewMode);

  const query = params.toString();
  const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, '', next);
}

export function useSearchState() {
  const initial = useMemo(() => readFromUrl(), []);

  const updateUrl = useCallback((state: SearchState) => {
    writeToUrl(state);
  }, []);

  return { initial, updateUrl };
}

export function buildSearchState(
  partial: Partial<SearchState> & Pick<SearchState, 'term'>,
): SearchState {
  return {
    ...DEFAULT_STATE,
    ...partial,
  };
}
