import type {
  Category,
  Poem,
  Poet,
  SearchResponse,
} from '@/types/ganjoor';
import { mapSearchHitsToGrouped } from '@/utils/searchMap';
import { parsePagingHeaders } from '@/utils/paging';
import { apiFetch, buildApiUrl } from './client';

export async function fetchPoets(signal?: AbortSignal): Promise<Poet[]> {
  const data = await apiFetch<Poet[]>(buildApiUrl('/poets'), signal);
  return Array.isArray(data) ? data : [];
}

export async function fetchCategories(
  poetId: number,
  signal?: AbortSignal,
): Promise<Category[]> {
  try {
    const data = await apiFetch<{ cat?: { children?: Category[] } } | { children?: Category[] }>(
      buildApiUrl(`/cat/${poetId}`, { poems: 'false' }),
      signal,
    );
    const cat = 'cat' in data && data.cat ? data.cat : (data as { children?: Category[] });
    return (cat.children ?? []).filter((item) => item?.id);
  } catch {
    return [];
  }
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
