export function parseBrowsePath(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split('/')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export function formatBrowsePath(path: number[]): string | null {
  if (path.length === 0) return null;
  return path.join('/');
}
