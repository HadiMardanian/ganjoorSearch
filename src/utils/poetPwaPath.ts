/** Per-poet PWA paths give each install a non-overlapping scope (required for multi-install). */

function basePath(): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

export function getPoetPwaScopePath(poetId: number): string {
  return `${basePath()}pwa/${poetId}/`;
}

export function getPoetPwaManifestId(poetId: number): string {
  return `${basePath()}pwa/${poetId}`.replace(/\/$/, '');
}

export function buildPoetPwaStartUrl(poetId: number): string {
  return `${getPoetPwaScopePath(poetId)}?source=pwa&tab=browse`;
}

export function parsePoetIdFromPwaPath(pathname: string): number | null {
  const match = pathname.match(/\/pwa\/(\d+)\/?$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function isPoetPwaPathname(pathname: string): boolean {
  return /\/pwa\/\d+\/?$/.test(pathname);
}

export function defaultAppPathname(): string {
  return basePath().replace(/\/$/, '') || '/';
}
