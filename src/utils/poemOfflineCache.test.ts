import { describe, expect, it, beforeEach, vi } from 'vitest';
import { readOfflinePoem, saveOfflinePoem } from '@/utils/poemOfflineCache';
import type { Poem } from '@/types/ganjoor';

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

const samplePoem: Poem = {
  id: 1,
  title: 'غزل ۱',
  fullUrl: '/hafez/ghazal/sh1',
  plainText: 'بیت نمونه',
};

describe('poemOfflineCache', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', createStorage());
  });

  it('saves and reads cached poems', () => {
    saveOfflinePoem('/hafez/ghazal/sh1', samplePoem);
    expect(readOfflinePoem('/hafez/ghazal/sh1')?.title).toBe('غزل ۱');
  });

  it('returns null for missing cache', () => {
    expect(readOfflinePoem('/missing')).toBeNull();
  });
});
