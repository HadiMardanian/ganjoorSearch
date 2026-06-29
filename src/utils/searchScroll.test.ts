import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearSearchScroll,
  readSearchScroll,
  saveSearchScroll,
} from './searchScroll';

describe('searchScroll', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(globalThis, 'window', {
      value: globalThis,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
      configurable: true,
    });
  });

  it('saves and restores scroll for matching search context', () => {
    saveSearchScroll('جام', 1, 'all', 2, 480);
    expect(readSearchScroll('جام', 1, 'all', 2)).toBe(480);
    expect(readSearchScroll('جام', 1, 'all', 1)).toBeNull();
  });

  it('clears saved scroll', () => {
    saveSearchScroll('می', 'all', 'all', 1, 120);
    clearSearchScroll();
    expect(readSearchScroll('می', 'all', 'all', 1)).toBeNull();
  });
});
