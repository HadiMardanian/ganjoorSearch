export interface LastReadEntry {
  poemUrl: string;
  poemTitle: string;
  categoryTitle?: string;
  readAt: number;
}

function storageKey(poetId: number) {
  return `ganjoorsearch-last-read-${poetId}`;
}

export function saveLastRead(poetId: number, entry: Omit<LastReadEntry, 'readAt'>) {
  const payload: LastReadEntry = { ...entry, readAt: Date.now() };
  localStorage.setItem(storageKey(poetId), JSON.stringify(payload));
}

export function readLastRead(poetId: number): LastReadEntry | null {
  try {
    const raw = localStorage.getItem(storageKey(poetId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastReadEntry;
    if (!parsed.poemUrl || !parsed.poemTitle) return null;
    return parsed;
  } catch {
    return null;
  }
}
