const INSTALLED_POETS_KEY = 'ganjoorsearch-installed-poet-ids';
const LEGACY_POET_KEY = 'ganjoorsearch-installed-poet';

function readIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INSTALLED_POETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === 'number' && id > 0);
  } catch {
    return [];
  }
}

function writeIds(ids: number[]): void {
  const unique = [...new Set(ids)].sort((a, b) => a - b);
  localStorage.setItem(INSTALLED_POETS_KEY, JSON.stringify(unique));
}

function migrateLegacyInstalledPoet(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LEGACY_POET_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { id?: unknown };
    if (typeof parsed.id === 'number' && parsed.id > 0) {
      recordInstalledPoetId(parsed.id);
    }
  } catch {
    /* ignore */
  }
}

export function readInstalledPoetIds(): number[] {
  migrateLegacyInstalledPoet();
  return readIds();
}

export function isPoetRecordedAsInstalled(poetId: number): boolean {
  migrateLegacyInstalledPoet();
  return readIds().includes(poetId);
}

export function recordInstalledPoetId(poetId: number): void {
  if (poetId <= 0) return;
  const next = readIds();
  if (next.includes(poetId)) return;
  writeIds([...next, poetId]);
}
