import { getPoetPwaScopePath } from '@/utils/poetPwaPath';

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

  const usePoetPath = params.source === 'pwa' && params.poetId != null;
  const pathname = usePoetPath
    ? getPoetPwaScopePath(params.poetId!).replace(/\/$/, '')
    : root.endsWith('/')
      ? root.slice(0, -1)
      : root;

  const url = new URL(pathname, 'https://example.com');
  const search = url.searchParams;

  if (params.term?.trim()) search.set('q', params.term.trim());
  if (params.poetId != null && !usePoetPath) search.set('poet', String(params.poetId));
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
  const pathWithBase = usePoetPath ? pathname : root.endsWith('/') ? root.slice(0, -1) : root;
  return query ? `${pathWithBase}?${query}` : pathWithBase;
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
