import { useCallback, useEffect, useState } from 'react';
import type { PoetFilter, ViewMode } from '@/types/ganjoor';

export interface SearchState {
  term: string;
  poetId: PoetFilter;
  page: number;
  viewMode: ViewMode;
}

const DEFAULT_STATE: SearchState = {
  term: '',
  poetId: 'all',
  page: 1,
  viewMode: 'verse',
};

function readFromUrl(): SearchState {
  if (typeof window === 'undefined') return DEFAULT_STATE;

  const params = new URLSearchParams(window.location.search);

  const poet = params.get('poet');
  const page = Number(params.get('page') ?? '1');
  const mode = params.get('mode');

  const poetNum = poet ? Number(poet) : NaN;

  return {
    term: params.get('q') ?? '',
    poetId: poet && poet !== 'all' && Number.isFinite(poetNum) ? poetNum : 'all',
    page: Number.isFinite(page) && page > 0 ? page : 1,
    viewMode: mode === 'full' ? 'full' : 'verse',
  };
}

function writeToUrl(state: SearchState) {
  const params = new URLSearchParams();

  if (state.term) params.set('q', state.term);
  if (state.poetId !== 'all') params.set('poet', String(state.poetId));
  if (state.page > 1) params.set('page', String(state.page));
  if (state.viewMode !== 'verse') params.set('mode', state.viewMode);

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
