import type { CategoryDetail } from '@/types/ganjoor';

const STORAGE_KEY = 'ganjoorsearch-offline-categories';
const MAX_ENTRIES = 12;

interface CachedCategory {
  categoryId: number;
  detail: CategoryDetail;
  cachedAt: number;
}

function readAll(): CachedCategory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CachedCategory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: CachedCategory[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 6)));
  }
}

export function saveOfflineCategory(categoryId: number, detail: CategoryDetail): void {
  const without = readAll().filter((item) => item.categoryId !== categoryId);
  without.unshift({ categoryId, detail, cachedAt: Date.now() });
  writeAll(without.slice(0, MAX_ENTRIES));
}

export function readOfflineCategory(categoryId: number): CategoryDetail | null {
  return readAll().find((item) => item.categoryId === categoryId)?.detail ?? null;
}
