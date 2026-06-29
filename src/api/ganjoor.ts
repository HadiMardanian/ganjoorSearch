import type {
  Category,
  GroupedResult,
  Poem,
  Poet,
  SearchResponse,
} from '@/types/ganjoor';
import { mapSearchHitsToGrouped } from '@/utils/searchMap';
import { parsePagingHeaders } from '@/utils/paging';
import { apiFetch, buildApiUrl } from './client';

const EXPORT_PAGE_SIZE = 200;

export async function fetchPoets(signal?: AbortSignal): Promise<Poet[]> {
  const data = await apiFetch<Poet[]>(buildApiUrl('/poets'), signal);
  return Array.isArray(data) ? data : [];
}

export async function fetchCategories(
  poetId: number,
  signal?: AbortSignal,
): Promise<Category[]> {
  const data = await apiFetch<{ cat?: { children?: Category[] } }>(
    buildApiUrl(`/poet/${poetId}`),
    signal,
  );

  return (data.cat?.children ?? []).filter(
    (item): item is Category => Boolean(item?.id && item?.title),
  );
}

export async function searchPoems(
  term: string,
  options: {
    poetId?: number | 'all';
    categoryId?: number | 'all';
    page?: number;
    pageSize?: number;
    signal?: AbortSignal;
  } = {},
): Promise<SearchResponse> {
  const trimmed = term.trim();
  const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 200);
  const page = Math.max(options.page ?? 1, 1);

  if (!trimmed) {
    return { results: [], page: 1, hasMore: false, pageSize, totalCount: 0, totalPages: 0 };
  }

  const params: Record<string, string> = {
    term: trimmed,
    PageNumber: String(page),
    PageSize: String(pageSize),
  };

  if (options.poetId != null && options.poetId !== 'all') {
    params.poetId = String(options.poetId);
  }

  if (options.categoryId != null && options.categoryId !== 'all') {
    params.catId = String(options.categoryId);
  }

  let response: Response;

  try {
    response = await fetch(buildApiUrl('/poems/search', params), {
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new Error(
      'خطا در اتصال به سرور گنجور. ممکن است نیاز به استفاده از یک پروکسی یا سرور میانی باشد.',
    );
  }

  if (!response.ok) {
    throw new Error(`خطای سرور: ${response.status} ${response.statusText}`);
  }

  let raw: unknown;

  try {
    raw = await response.json();
  } catch {
    throw new Error('خطا در پردازش پاسخ سرور');
  }

  const items = Array.isArray(raw)
    ? raw
    : (raw as { items?: Poem[]; results?: Poem[] }).items ??
      (raw as { results?: Poem[] }).results ??
      [];

  if (!Array.isArray(items) || items.length === 0) {
    const paging = parsePagingHeaders(response);
    return {
      results: [],
      page,
      hasMore: false,
      pageSize,
      totalCount: paging?.totalCount ?? 0,
      totalPages: paging?.totalPages ?? 0,
    };
  }

  const results = mapSearchHitsToGrouped(items, trimmed);
  const paging = parsePagingHeaders(response);

  return {
    results,
    page,
    hasMore: paging?.hasNextPage ?? items.length === pageSize,
    pageSize,
    totalCount: paging?.totalCount ?? 0,
    totalPages: paging?.totalPages ?? 0,
  };
}

export async function fetchAllSearchResults(
  term: string,
  options: {
    poetId?: number | 'all';
    categoryId?: number | 'all';
    signal?: AbortSignal;
    onProgress?: (loaded: number, total: number) => void;
  } = {},
): Promise<GroupedResult[]> {
  const allResults: GroupedResult[] = [];
  let page = 1;
  let totalPages = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await searchPoems(term, {
      poetId: options.poetId,
      categoryId: options.categoryId,
      page,
      pageSize: EXPORT_PAGE_SIZE,
      signal: options.signal,
    });

    allResults.push(...response.results);

    if (response.totalPages > 0) {
      totalPages = response.totalPages;
      hasMore = page < totalPages;
      options.onProgress?.(page, totalPages);
      page += 1;
      continue;
    }

    hasMore = response.hasMore;
    options.onProgress?.(page, page + (hasMore ? 1 : 0));

    if (!hasMore) break;
    page += 1;

    if (page > 500) {
      throw new Error('تعداد صفحات نتایج از حد مجاز بیشتر است.');
    }
  }

  return allResults;
}

export async function fetchPoem(url: string, signal?: AbortSignal): Promise<Poem> {
  return apiFetch<Poem>(buildApiUrl('/poem', { url }), signal);
}
