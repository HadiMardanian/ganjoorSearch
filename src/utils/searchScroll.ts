import type { CategoryFilter, PoetFilter } from '@/types/ganjoor';
import { filterKey } from '@/utils/filterState';

const STORAGE_KEY = 'ganjoorsearch-search-scroll';

export interface SearchScrollState {
  term: string;
  poetId: PoetFilter;
  categoryId: CategoryFilter;
  page: number;
  scrollY: number;
}

function matchesContext(
  saved: SearchScrollState,
  term: string,
  poetId: PoetFilter,
  categoryId: CategoryFilter,
  page: number,
): boolean {
  return (
    saved.term === term &&
    filterKey(saved.poetId) === filterKey(poetId) &&
    filterKey(saved.categoryId) === filterKey(categoryId) &&
    saved.page === page
  );
}

export function saveSearchScroll(
  term: string,
  poetId: PoetFilter,
  categoryId: CategoryFilter,
  page: number,
  scrollY: number,
): void {
  if (typeof window === 'undefined' || scrollY <= 0) return;
  try {
    const state: SearchScrollState = { term, poetId, categoryId, page, scrollY };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function readSearchScroll(
  term: string,
  poetId: PoetFilter,
  categoryId: CategoryFilter,
  page: number,
): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SearchScrollState;
    if (!matchesContext(saved, term, poetId, categoryId, page)) return null;
    return typeof saved.scrollY === 'number' && saved.scrollY > 0 ? saved.scrollY : null;
  } catch {
    return null;
  }
}

export function clearSearchScroll(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
