const BASE = import.meta.env.BASE_URL;

export interface AppDeepLinkParams {
  poetId?: number;
  poemUrl?: string | null;
  source?: 'pwa' | null;
  tab?: 'browse' | 'search';
  term?: string;
  browsePath?: number[];
  poemListPage?: number;
}

export function buildAppDeepLink(params: AppDeepLinkParams, origin?: string): string {
  const root =
    origin ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}${BASE}`
      : `https://example.com${BASE}`);

  const url = new URL(root.endsWith('/') ? root : `${root}/`);
  const search = url.searchParams;

  if (params.term?.trim()) search.set('q', params.term.trim());
  if (params.poetId != null) search.set('poet', String(params.poetId));
  if (params.poemUrl) search.set('poem', params.poemUrl);
  if (params.source === 'pwa') search.set('source', 'pwa');
  if (params.tab) search.set('tab', params.tab);
  if (params.browsePath?.length) {
    search.set('bpath', params.browsePath.join('.'));
  }
  if (params.poemListPage != null && params.poemListPage > 1) {
    search.set('plist', String(params.poemListPage));
  }

  const query = search.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

export function buildPoemDeepLink(
  poetId: number,
  poemUrl: string,
  options: { source?: 'pwa' | null; tab?: 'browse' | 'search' } = {},
  origin?: string,
): string {
  return buildAppDeepLink(
    {
      poetId,
      poemUrl,
      source: options.source ?? null,
      tab: options.tab ?? 'browse',
    },
    origin,
  );
}
