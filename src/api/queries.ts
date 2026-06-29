import { useQuery } from '@tanstack/react-query';
import {
  fetchCategories,
  fetchCategoryDetail,
  fetchPoem,
  fetchPoemRecitations,
  fetchPoetDetail,
  fetchPoets,
  searchPoemsMerged,
} from '@/api/ganjoor';
import { STALE_TIMES } from '@/lib/queryClient';
import type { CategoryFilter, PoetFilter } from '@/types/ganjoor';
import {
  readOfflineCategory,
  saveOfflineCategory,
} from '@/utils/categoryOfflineCache';
import { filterKey, singleFilterId } from '@/utils/filterState';
import { readOfflinePoem, saveOfflinePoem } from '@/utils/poemOfflineCache';

export async function fetchPoemWithOfflineFallback(poemUrl: string, signal?: AbortSignal) {
  try {
    const poem = await fetchPoem(poemUrl, signal);
    saveOfflinePoem(poemUrl, poem);
    return { poem, fromCache: false as const };
  } catch (error) {
    const cached = readOfflinePoem(poemUrl);
    if (cached) return { poem: cached, fromCache: true as const };
    throw error;
  }
}

async function fetchCategoryDetailWithOfflineFallback(
  categoryId: number,
  withPoems: boolean,
  signal?: AbortSignal,
) {
  try {
    const detail = await fetchCategoryDetail(categoryId, { withPoems, signal });
    if (withPoems) saveOfflineCategory(categoryId, detail);
    return { detail, fromCache: false as const };
  } catch (error) {
    const cached = readOfflineCategory(categoryId);
    if (cached) return { detail: cached, fromCache: true as const };
    throw error;
  }
}

export function usePoetsQuery() {
  return useQuery({
    queryKey: ['poets'],
    queryFn: ({ signal }) => fetchPoets(signal),
    staleTime: STALE_TIMES.poets,
  });
}

export function usePoetDetailQuery(poetId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['poet-detail', poetId],
    queryFn: ({ signal }) => fetchPoetDetail(poetId!, signal),
    enabled: enabled && poetId != null && Number.isFinite(poetId),
    staleTime: STALE_TIMES.categories,
  });
}

export function useCategoryDetailQuery(
  categoryId: number | null,
  withPoems: boolean,
  enabled = true,
) {
  return useQuery({
    queryKey: ['category-detail', categoryId, withPoems],
    queryFn: ({ signal }) =>
      fetchCategoryDetailWithOfflineFallback(categoryId!, withPoems, signal),
    enabled: enabled && categoryId != null && Number.isFinite(categoryId),
    staleTime: STALE_TIMES.categories,
    select: (data) => data.detail,
  });
}

export function usePoemDetailQuery(poemUrl: string | null, enabled = true) {
  return useQuery({
    queryKey: ['poem-detail', poemUrl],
    queryFn: ({ signal }) => fetchPoemWithOfflineFallback(poemUrl!, signal),
    enabled: enabled && Boolean(poemUrl),
    staleTime: STALE_TIMES.poem,
  });
}

export function usePoemRecitationsQuery(poemId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['poem-recitations', poemId],
    queryFn: ({ signal }) => fetchPoemRecitations(poemId!, signal),
    enabled: enabled && poemId != null && Number.isFinite(poemId),
    staleTime: STALE_TIMES.poem,
  });
}

export function useCategoriesQuery(poetId: PoetFilter) {
  const poet = singleFilterId(poetId);
  return useQuery({
    queryKey: ['categories', filterKey(poetId)],
    queryFn: ({ signal }) => fetchCategories(poet!, signal),
    enabled: poet != null,
    staleTime: STALE_TIMES.categories,
  });
}

export function useSearchQuery(
  term: string,
  poetId: PoetFilter,
  categoryId: CategoryFilter,
  page: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['search', term, filterKey(poetId), filterKey(categoryId), page],
    queryFn: ({ signal }) =>
      searchPoemsMerged(term, {
        poetIds: poetId,
        categoryIds: categoryId,
        page,
        pageSize: 20,
        signal,
      }),
    enabled: enabled && term.trim().length > 0,
    staleTime: STALE_TIMES.search,
    placeholderData: (previous) => previous,
  });
}
