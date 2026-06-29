import type {
  Category,
  GroupedResult,
  Poem,
  Poet,
  SearchResponse,
  SearchResult,
  Verse,
} from '@/types/ganjoor';
import { STALE_TIMES, queryClient } from '@/lib/queryClient';
import { poemFetchLimiter } from '@/utils/parallel';
import { apiFetch, buildApiUrl } from './client';

function getCoupletIndex(verse: Verse): number {
  return verse.coupletIndex ?? Math.floor(verse.vOrder / 2);
}

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

export async function fetchPoem(url: string, signal?: AbortSignal): Promise<Poem> {
  return apiFetch<Poem>(buildApiUrl('/poem', { url }), signal);
}

async function getCachedPoem(url: string, signal?: AbortSignal): Promise<Poem> {
  return queryClient.fetchQuery({
    queryKey: ['poem', url],
    queryFn: () => fetchPoem(url, signal),
    staleTime: STALE_TIMES.poem,
  });
}

async function enrichSearchResults(
  items: Poem[],
  term: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const normalizedTerm = term.toLowerCase();
  const results: SearchResult[] = [];
  const fetchedUrls = new Set<string>();

  const enriched = await Promise.all(
    items.map((item) =>
      poemFetchLimiter(async () => {
        if (item.verses && item.verses.length > 0) {
          return item;
        }

        const poemUrl =
          item.fullUrl ?? (item.id ? `/hafez/ghazal/sh${item.id}` : null);

        if (!poemUrl) {
          return null;
        }

        if (fetchedUrls.has(poemUrl)) {
          const cached = queryClient.getQueryData<Poem>(['poem', poemUrl]);
          if (cached) {
            return {
              ...cached,
              id: cached.id ?? item.id,
              title: cached.title ?? item.title,
              fullUrl: cached.fullUrl ?? item.fullUrl,
              urlSlug: cached.urlSlug ?? item.urlSlug,
            };
          }
        }

        fetchedUrls.add(poemUrl);

        try {
          const full = await getCachedPoem(poemUrl, signal);
          return {
            ...full,
            id: full.id ?? item.id,
            title: full.title ?? item.title,
            fullUrl: full.fullUrl ?? item.fullUrl,
            urlSlug: full.urlSlug ?? item.urlSlug,
          };
        } catch {
          return null;
        }
      }),
    ),
  );

  for (const poem of enriched) {
    if (!poem?.verses?.length) continue;

    const matchingVerses = poem.verses.filter((verse) =>
      verse.text?.toLowerCase().includes(normalizedTerm),
    );

    if (matchingVerses.length === 0) continue;

    const coupletMap = new Map<number, Verse[]>();

    for (const verse of matchingVerses) {
      const index = getCoupletIndex(verse);
      const group = coupletMap.get(index) ?? [];
      group.push(verse);
      coupletMap.set(index, group);
    }

    for (const [coupletIndex] of coupletMap) {
      const allInCouplet = poem.verses
        .filter((verse) => getCoupletIndex(verse) === coupletIndex)
        .sort((a, b) => a.vOrder - b.vOrder);

      results.push({
        poemId: poem.id,
        poemTitle: poem.title || 'بدون عنوان',
        fullUrl: poem.fullUrl || `/hafez/ghazal/sh${poem.id}`,
        urlSlug: poem.urlSlug,
        matchingVerses: allInCouplet,
        allVerses: poem.verses,
        plainText: poem.plainText,
        htmlText: poem.htmlText,
        coupletIndex,
      });
    }
  }

  return results;
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
    return { results: [], page: 1, hasMore: false, pageSize };
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
    return { results: [], page, hasMore: false, pageSize };
  }

  const results = await enrichSearchResults(items, trimmed, options.signal);

  return {
    results,
    page,
    hasMore: items.length === pageSize,
    pageSize,
  };
}

export function groupSearchResults(results: SearchResult[]): GroupedResult[] {
  const map = new Map<number, GroupedResult>();

  for (const result of results) {
    const existing = map.get(result.poemId);

    if (!existing) {
      map.set(result.poemId, {
        poemId: result.poemId,
        poemTitle: result.poemTitle,
        fullUrl: result.fullUrl,
        urlSlug: result.urlSlug,
        allVerses: result.allVerses,
        plainText: result.plainText,
        htmlText: result.htmlText,
        matchingCouplets: [
          { coupletIndex: result.coupletIndex, verses: result.matchingVerses },
        ],
      });
      continue;
    }

    existing.matchingCouplets.push({
      coupletIndex: result.coupletIndex,
      verses: result.matchingVerses,
    });
  }

  return Array.from(map.values());
}
