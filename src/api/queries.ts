import { useQuery } from '@tanstack/react-query';
import {
  fetchCategories,
  fetchCategoryDetail,
  fetchPoem,
  fetchPoetDetail,
  fetchPoets,
  searchPoems,
} from '@/api/ganjoor';
import { STALE_TIMES } from '@/lib/queryClient';
import type { CategoryFilter, PoetFilter } from '@/types/ganjoor';

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
      fetchCategoryDetail(categoryId!, { withPoems, signal }),
    enabled: enabled && categoryId != null && Number.isFinite(categoryId),
    staleTime: STALE_TIMES.categories,
  });
}

export function usePoemDetailQuery(poemUrl: string | null, enabled = true) {
  return useQuery({
    queryKey: ['poem-detail', poemUrl],
    queryFn: ({ signal }) => fetchPoem(poemUrl!, signal),
    enabled: enabled && Boolean(poemUrl),
    staleTime: STALE_TIMES.poem,
  });
}

export function useCategoriesQuery(poetId: PoetFilter) {
  return useQuery({
    queryKey: ['categories', poetId],
    queryFn: ({ signal }) =>
      poetId === 'all' ? Promise.resolve([]) : fetchCategories(poetId, signal),
    enabled: poetId !== 'all' && Number.isFinite(poetId),
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
    queryKey: ['search', term, poetId, categoryId, page],
    queryFn: ({ signal }) =>
      searchPoems(term, {
        poetId,
        categoryId,
        page,
        pageSize: 20,
        signal,
      }),
    enabled: enabled && term.trim().length > 0,
    staleTime: STALE_TIMES.search,
    placeholderData: (previous) => previous,
  });
}
