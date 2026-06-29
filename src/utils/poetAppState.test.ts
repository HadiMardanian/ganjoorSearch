import { describe, expect, it } from 'vitest';
import {
  computeIsPoetApp,
  computeLockPoet,
  resolveActivePoetId,
  shouldStandaloneRedirectToStoredPoet,
} from './poetAppState';

describe('poetAppState', () => {
  it('prefers URL poet id over stored poet', () => {
    expect(
      resolveActivePoetId({
        urlPoetId: [3],
        urlSource: 'pwa',
        urlPoetParam: null,
        standalone: true,
        storedPoet: { id: 1, name: 'حافظ' },
      }),
    ).toBe(3);
  });

  it('falls back to stored poet in standalone mode', () => {
    expect(
      resolveActivePoetId({
        urlPoetId: 'all',
        urlSource: null,
        urlPoetParam: null,
        standalone: true,
        storedPoet: { id: 2, name: 'سعدی' },
      }),
    ).toBe(2);
  });

  it('does not use stored poet in browser tab', () => {
    expect(
      resolveActivePoetId({
        urlPoetId: 'all',
        urlSource: null,
        urlPoetParam: null,
        standalone: false,
        storedPoet: { id: 2, name: 'سعدی' },
      }),
    ).toBeNull();
  });

  it('detects poet app from pwa source', () => {
    expect(
      computeIsPoetApp({
        activePoetId: 1,
        urlSource: 'pwa',
        resolvedUrlPoetId: null,
        standalone: false,
        storedPoet: null,
      }),
    ).toBe(true);
  });

  it('does not enter poet app from stored poet alone in browser', () => {
    expect(
      computeIsPoetApp({
        activePoetId: 2,
        urlSource: null,
        resolvedUrlPoetId: null,
        standalone: false,
        storedPoet: { id: 2, name: 'سعدی' },
      }),
    ).toBe(false);
  });

  it('does not enter poet app from search poet filter alone', () => {
    expect(
      computeIsPoetApp({
        activePoetId: 2,
        urlSource: null,
        resolvedUrlPoetId: 2,
        standalone: false,
        storedPoet: null,
      }),
    ).toBe(false);
  });

  it('locks poet when standalone with stored poet', () => {
    expect(
      computeLockPoet({
        isPoetApp: true,
        standalone: true,
        urlSource: null,
      }),
    ).toBe(true);
  });

  it('locks poet in browser only with pwa source', () => {
    expect(
      computeLockPoet({
        isPoetApp: true,
        standalone: false,
        urlSource: 'pwa',
      }),
    ).toBe(true);

    expect(
      computeLockPoet({
        isPoetApp: true,
        standalone: false,
        urlSource: null,
      }),
    ).toBe(false);
  });

  it('does not redirect standalone when URL already has a poet (multi-PWA)', () => {
    expect(
      shouldStandaloneRedirectToStoredPoet({
        standalone: true,
        resolvedUrlPoetId: 43,
        storedPoet: { id: 15, name: 'فرخی سیستانی' },
      }),
    ).toBe(false);
  });

  it('redirects standalone without URL poet to stored fallback', () => {
    expect(
      shouldStandaloneRedirectToStoredPoet({
        standalone: true,
        resolvedUrlPoetId: null,
        storedPoet: { id: 43, name: 'بیدل دهلوی' },
      }),
    ).toBe(true);
  });
});
