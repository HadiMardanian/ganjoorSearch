import { useCallback, useEffect, useState } from 'react';
import type { CategoryFilter, PoetFilter } from '@/types/ganjoor';

export interface SearchHistoryEntry {
  term: string;
  poetId: PoetFilter;
  categoryId: CategoryFilter;
  timestamp: number;
}

const STORAGE_KEY = 'ganjoorsearch-history';
const MAX_ENTRIES = 15;

function readHistory(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SearchHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: SearchHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useSearchHistory() {
  const [entries, setEntries] = useState<SearchHistoryEntry[]>(() => readHistory());

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setEntries(readHistory());
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addEntry = useCallback((entry: Omit<SearchHistoryEntry, 'timestamp'>) => {
    const trimmed = entry.term.trim();
    if (!trimmed) return;

    setEntries((previous) => {
      const next = [
        { ...entry, term: trimmed, timestamp: Date.now() },
        ...previous.filter(
          (item) =>
            !(
              item.term === trimmed &&
              item.poetId === entry.poetId &&
              item.categoryId === entry.categoryId
            ),
        ),
      ].slice(0, MAX_ENTRIES);
      writeHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setEntries([]);
  }, []);

  return { entries, addEntry, clearHistory };
}
