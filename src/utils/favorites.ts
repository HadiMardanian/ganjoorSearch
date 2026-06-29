export interface FavoritePoem {
  poemUrl: string;
  poemTitle: string;
  categoryTitle?: string;
  poetId: number;
  savedAt: number;
}

const STORAGE_KEY = 'ganjoorsearch-favorites';

function readAll(): FavoritePoem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoritePoem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        typeof item.poemUrl === 'string' &&
        typeof item.poemTitle === 'string' &&
        typeof item.poetId === 'number',
    );
  } catch {
    return [];
  }
}

function writeAll(entries: FavoritePoem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function listFavorites(poetId?: number): FavoritePoem[] {
  const all = readAll().sort((a, b) => b.savedAt - a.savedAt);
  if (poetId == null) return all;
  return all.filter((item) => item.poetId === poetId);
}

export function isFavorite(poemUrl: string): boolean {
  return readAll().some((item) => item.poemUrl === poemUrl);
}

export function addFavorite(entry: Omit<FavoritePoem, 'savedAt'>): void {
  const next = readAll().filter((item) => item.poemUrl !== entry.poemUrl);
  next.unshift({ ...entry, savedAt: Date.now() });
  writeAll(next);
}

export function removeFavorite(poemUrl: string): void {
  writeAll(readAll().filter((item) => item.poemUrl !== poemUrl));
}

export function toggleFavorite(entry: Omit<FavoritePoem, 'savedAt'>): boolean {
  if (isFavorite(entry.poemUrl)) {
    removeFavorite(entry.poemUrl);
    return false;
  }
  addFavorite(entry);
  return true;
}
