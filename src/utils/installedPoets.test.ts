import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isPoetRecordedAsInstalled,
  readInstalledPoetIds,
  recordInstalledPoetId,
} from '@/utils/installedPoets';

function createStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe('installedPoets', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('records and reads installed poet ids', () => {
    expect(readInstalledPoetIds()).toEqual([]);
    recordInstalledPoetId(3);
    recordInstalledPoetId(2);
    recordInstalledPoetId(3);
    expect(readInstalledPoetIds()).toEqual([2, 3]);
    expect(isPoetRecordedAsInstalled(2)).toBe(true);
    expect(isPoetRecordedAsInstalled(5)).toBe(false);
  });

  it('migrates legacy single-poet key', () => {
    localStorage.setItem(
      'ganjoorsearch-installed-poet',
      JSON.stringify({ id: 7, name: 'سعدی' }),
    );
    expect(readInstalledPoetIds()).toEqual([7]);
    expect(isPoetRecordedAsInstalled(7)).toBe(true);
  });
});
