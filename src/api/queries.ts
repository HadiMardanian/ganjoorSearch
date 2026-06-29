import { useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchPoets, searchPoems } from '@/api/ganjoor';
import { STALE_TIMES } from '@/lib/queryClient';
import type { PoetFilter } from '@/types/ganjoor';

export function usePoetsQuery() {
  return useQuery({
    queryKey: ['poets'],
    queryFn: ({ signal }) => fetchPoets(signal),
    staleTime: STALE_TIMES.poets,
  });
}

export function useCategoriesQuery(poetId: PoetFilter) {
  return useQuery({
    queryKey: ['categories', poetId],
    queryFn: ({ signal }) =>
      poetId === 'all' ? Promise.resolve([]) : fetchCategories(poetId, signal),
    enabled: poetId !== 'all' && Number.isFinite(poetId),
    staleTime: STALE_TIMES.categories,
    placeholderData: (previous) => previous,
  });
}

export function useSearchQuery(
  term: string,
  poetId: PoetFilter,
  page: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['search', term, poetId, page],
    queryFn: ({ signal }) =>
      searchPoems(term, {
        poetId,
        page,
        pageSize: 20,
        signal,
      }),
    enabled: enabled && term.trim().length > 0,
    staleTime: STALE_TIMES.search,
    placeholderData: (previous) => previous,
  });
}
