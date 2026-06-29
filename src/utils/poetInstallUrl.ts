import { getPoetPwaScopePath } from '@/utils/poetPwaPath';

/** Full-page URL so the browser loads the correct manifest and can fire beforeinstallprompt again. */
export function buildPoetInstallUrl(poetId: number): string {
  return `${getPoetPwaScopePath(poetId)}?install=1`;
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
