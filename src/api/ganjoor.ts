import type {
  Category,
  CategoryDetail,
  GroupedResult,
  Poem,
  Poet,
  PoetDetail,
  PoetWithCatalog,
  SearchResponse,
} from '@/types/ganjoor';
import { mapWithConcurrency } from '@/utils/parallel';
import { mapSearchHitsToGrouped } from '@/utils/searchMap';
import { parsePagingHeaders } from '@/utils/paging';
import { apiFetch, buildApiUrl } from './client';

const EXPORT_PAGE_SIZE = 200;
const PAGE_FETCH_CONCURRENCY = 4;

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

export type ExportProgress = {
  phase: 'fetching' | 'enriching';
  loadedPages: number;
  totalPages: number;
  loadedItems: number;
  totalItems: number;
};

export type ExportScope = 'all' | 'page';

export async function fetchAllSearchResults(
  term: string,
  options: {
    poetId?: number | 'all';
    categoryId?: number | 'all';
    scope?: ExportScope;
    page?: number;
    signal?: AbortSignal;
    onProgress?: (progress: ExportProgress) => void;
  } = {},
): Promise<GroupedResult[]> {
  const scope = options.scope ?? 'all';
  const page = Math.max(options.page ?? 1, 1);

  if (scope === 'page') {
    const response = await searchPoems(term, {
      poetId: options.poetId,
      categoryId: options.categoryId,
      page,
      pageSize: EXPORT_PAGE_SIZE,
      signal: options.signal,
    });

    options.onProgress?.({
      phase: 'fetching',
      loadedPages: 1,
      totalPages: 1,
      loadedItems: response.results.length,
      totalItems: response.totalCount || response.results.length,
    });

    return response.results;
  }

  const first = await searchPoems(term, {
    poetId: options.poetId,
    categoryId: options.categoryId,
    page: 1,
    pageSize: EXPORT_PAGE_SIZE,
    signal: options.signal,
  });

  const allResults = [...first.results];
  const totalPages = first.totalPages > 0 ? first.totalPages : first.hasMore ? 2 : 1;
  const totalItems = first.totalCount || allResults.length;

  options.onProgress?.({
    phase: 'fetching',
    loadedPages: 1,
    totalPages,
    loadedItems: allResults.length,
    totalItems,
  });

  if (totalPages <= 1) {
    return allResults;
  }

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
  let completedPages = 1;

  const pageBatches = await mapWithConcurrency(
    remainingPages,
    PAGE_FETCH_CONCURRENCY,
    async (pageNumber) => {
      const response = await searchPoems(term, {
        poetId: options.poetId,
        categoryId: options.categoryId,
        page: pageNumber,
        pageSize: EXPORT_PAGE_SIZE,
        signal: options.signal,
      });

      completedPages += 1;

      options.onProgress?.({
        phase: 'fetching',
        loadedPages: completedPages,
        totalPages,
        loadedItems: allResults.length + response.results.length,
        totalItems,
      });

      return { pageNumber, results: response.results };
    },
  );

  pageBatches
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .forEach((batch) => allResults.push(...batch.results));

  if (totalPages > 500) {
    throw new Error('تعداد صفحات نتایج از حد مجاز بیشتر است.');
  }

  return allResults;
}

export async function fetchPoem(url: string, signal?: AbortSignal): Promise<Poem> {
  return apiFetch<Poem>(buildApiUrl('/poem', { url }), signal);
}

export async function fetchPoetDetail(
  poetId: number,
  signal?: AbortSignal,
): Promise<PoetWithCatalog> {
  const data = await apiFetch<{
    poet?: PoetDetail;
    cat?: CategoryDetail;
  }>(buildApiUrl(`/poet/${poetId}`), signal);

  const poet = data.poet ?? ({} as PoetDetail);
  const rootCategory = normalizeCategoryDetail(data.cat);

  return {
    poet: {
      id: poet.id ?? poetId,
      name: poet.name ?? poet.nickname ?? '',
      fullName: poet.name,
      description: poet.description,
      imageUrl: poet.imageUrl,
      fullUrl: poet.fullUrl,
      rootCatId: poet.rootCatId,
      nickname: poet.nickname,
    },
    rootCategory,
  };
}

export async function fetchCategoryDetail(
  categoryId: number,
  options: { withPoems?: boolean; signal?: AbortSignal } = {},
): Promise<CategoryDetail> {
  const params: Record<string, string> = {};
  if (options.withPoems) {
    params.poems = 'true';
    params.mainSections = 'false';
  } else {
    params.poems = 'false';
  }

  const data = await apiFetch<{ cat?: CategoryDetail }>(
    buildApiUrl(`/cat/${categoryId}`, params),
    options.signal,
  );

  return normalizeCategoryDetail(data.cat);
}

function normalizeCategoryDetail(cat?: CategoryDetail | null): CategoryDetail {
  const children = (cat?.children ?? []).filter(
    (item): item is Category => Boolean(item?.id && item?.title),
  );
  const poems = (cat?.poems ?? []).map((poem) => ({
    ...poem,
    fullUrl: poem.fullUrl ?? buildPoemUrl(cat?.fullUrl, poem.urlSlug),
  }));

  return {
    id: cat?.id ?? 0,
    title: cat?.title ?? '',
    fullUrl: cat?.fullUrl,
    urlSlug: cat?.urlSlug,
    description: cat?.description,
    children,
    poems,
    poemCount: poems.length || cat?.poemCount,
  };
}

export function buildPoemUrl(categoryFullUrl?: string, poemSlug?: string): string | undefined {
  if (!categoryFullUrl || !poemSlug) return undefined;
  return `${categoryFullUrl}/${poemSlug}`;
}
