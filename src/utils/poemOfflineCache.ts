import type { Poem } from '@/types/ganjoor';

const STORAGE_KEY = 'ganjoorsearch-offline-poems';
const MAX_ENTRIES = 40;

interface CachedPoem {
  poemUrl: string;
  poem: Poem;
  cachedAt: number;
}

function readAll(): CachedPoem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CachedPoem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: CachedPoem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    const trimmed = entries.slice(0, Math.floor(MAX_ENTRIES / 2));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
}

export function saveOfflinePoem(poemUrl: string, poem: Poem): void {
  const without = readAll().filter((item) => item.poemUrl !== poemUrl);
  without.unshift({ poemUrl, poem, cachedAt: Date.now() });
  writeAll(without.slice(0, MAX_ENTRIES));
}

export function readOfflinePoem(poemUrl: string): Poem | null {
  const hit = readAll().find((item) => item.poemUrl === poemUrl);
  return hit?.poem ?? null;
}

export function listOfflinePoemUrls(poetId?: number): string[] {
  return readAll()
    .filter((item) => (poetId == null ? true : item.poem.id != null))
    .map((item) => item.poemUrl);
}
