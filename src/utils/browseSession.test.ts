import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  clearBrowseSession,
  isDefaultPoetAppLaunch,
  mergeBrowseSessionIntoState,
  readBrowseSession,
  saveBrowseSession,
} from '@/utils/browseSession';

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

describe('browseSession', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', createStorage());
  });

  it('saves and restores browse path with poem list page', () => {
    saveBrowseSession(2, {
      tab: 'browse',
      browsePath: [24],
      poemListPage: 2,
      poemUrl: null,
      searchTerm: '',
    });

    const session = readBrowseSession(2);
    expect(session?.browsePath).toEqual([24]);
    expect(session?.poemListPage).toBe(2);
  });

  it('merges session into default poet app launch state', () => {
    saveBrowseSession(2, {
      tab: 'browse',
      browsePath: [24],
      poemListPage: 2,
      poemUrl: null,
      searchTerm: '',
    });

    const merged = mergeBrowseSessionIntoState({
      term: '',
      poetId: [2],
      source: 'pwa',
      tab: 'browse',
      browsePath: [],
      poemListPage: 1,
      poemUrl: null,
    });

    expect(merged.browsePath).toEqual([24]);
    expect(merged.poemListPage).toBe(2);
  });

  it('does not merge when URL already has browse state', () => {
    saveBrowseSession(2, {
      tab: 'browse',
      browsePath: [24],
      poemListPage: 2,
      poemUrl: null,
      searchTerm: '',
    });

    const merged = mergeBrowseSessionIntoState({
      term: '',
      poetId: [2],
      source: 'pwa',
      tab: 'browse',
      browsePath: [9],
      poemListPage: 1,
      poemUrl: null,
    });

    expect(merged.browsePath).toEqual([9]);
    expect(merged.poemListPage).toBe(1);
  });

  it('clears stored session', () => {
    saveBrowseSession(2, {
      tab: 'browse',
      browsePath: [24],
      poemListPage: 2,
      poemUrl: null,
      searchTerm: '',
    });
    clearBrowseSession(2);
    expect(readBrowseSession(2)).toBeNull();
  });

  it('detects default launch state', () => {
    expect(
      isDefaultPoetAppLaunch({
        browsePath: [],
        poemListPage: 1,
        poemUrl: null,
        term: '',
      }),
    ).toBe(true);

    expect(
      isDefaultPoetAppLaunch({
        browsePath: [24],
        poemListPage: 2,
        poemUrl: null,
        term: '',
      }),
    ).toBe(false);
  });
});
