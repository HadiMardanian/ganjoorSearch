import type { CategoryFilter, PoetFilter } from '@/types/ganjoor';

export function parseIdListParam(value: string | null): PoetFilter | CategoryFilter {
  if (!value || value === 'all') return 'all';
  const ids = value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
  return ids.length === 0 ? 'all' : ids;
}

export function formatIdListParam(filter: PoetFilter | CategoryFilter): string | null {
  if (filter === 'all' || filter.length === 0) return null;
  return filter.join(',');
}

export function isAllFilter(filter: PoetFilter | CategoryFilter): filter is 'all' {
  return filter === 'all';
}

export function singleFilterId(filter: PoetFilter | CategoryFilter): number | undefined {
  if (filter === 'all' || filter.length !== 1) return undefined;
  return filter[0];
}

export function filterKey(filter: PoetFilter | CategoryFilter): string {
  if (filter === 'all') return 'all';
  return [...filter].sort((a, b) => a - b).join(',');
}

export function filtersEqual(
  a: PoetFilter | CategoryFilter,
  b: PoetFilter | CategoryFilter,
): boolean {
  return filterKey(a) === filterKey(b);
}

export function toggleFilterId(
  filter: PoetFilter | CategoryFilter,
  id: number,
): PoetFilter | CategoryFilter {
  if (filter === 'all') return [id];
  if (filter.includes(id)) {
    const next = filter.filter((item) => item !== id);
    return next.length === 0 ? 'all' : next;
  }
  return [...filter, id].sort((a, b) => a - b);
}

export function searchCombinationCount(
  poetIds: PoetFilter,
  categoryIds: CategoryFilter,
): number {
  const poets = poetIds === 'all' ? 1 : poetIds.length;
  const cats = categoryIds === 'all' ? 1 : categoryIds.length;
  return poets * cats;
}
