import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  addFavorite,
  isFavorite,
  listFavorites,
  removeFavorite,
  toggleFavorite,
} from '@/utils/favorites';

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

describe('favorites', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', createStorage());
  });

  it('adds and lists favorites per poet', () => {
    addFavorite({
      poemUrl: '/hafez/ghazal/sh1',
      poemTitle: 'غزل ۱',
      poetId: 2,
    });

    expect(isFavorite('/hafez/ghazal/sh1')).toBe(true);
    expect(listFavorites(2)).toHaveLength(1);
    expect(listFavorites(4)).toHaveLength(0);
  });

  it('toggles favorite state', () => {
    const entry = {
      poemUrl: '/hafez/ghazal/sh2',
      poemTitle: 'غزل ۲',
      poetId: 2,
    };

    expect(toggleFavorite(entry)).toBe(true);
    expect(toggleFavorite(entry)).toBe(false);
    expect(isFavorite(entry.poemUrl)).toBe(false);
  });

  it('removes favorites', () => {
    addFavorite({
      poemUrl: '/hafez/ghazal/sh3',
      poemTitle: 'غزل ۳',
      poetId: 2,
    });
    removeFavorite('/hafez/ghazal/sh3');
    expect(listFavorites()).toHaveLength(0);
  });
});
