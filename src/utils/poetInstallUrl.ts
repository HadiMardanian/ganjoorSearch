import { defaultAppPathname } from '@/utils/poetPwaPath';

/** Full-page URL on the main app path (HTTP 200) so install flow is reliable on GitHub Pages. */
export function buildPoetInstallUrl(poetId: number): string {
  const base = defaultAppPathname();
  return `${base}?install=1&poet=${poetId}`;
}

export function parseInstallPoetIdFromUrl(): number | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('install') !== '1') return null;
  const fromParam = Number(params.get('poet'));
  if (Number.isFinite(fromParam) && fromParam > 0) return fromParam;
  const match = window.location.pathname.match(/\/pwa\/(\d+)\/?/);
  if (!match) return null;
  const fromPath = Number(match[1]);
  return Number.isFinite(fromPath) && fromPath > 0 ? fromPath : null;
}

export function clearInstallParamFromUrl(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('install')) return;
  params.delete('install');
  const query = params.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', next);
}
