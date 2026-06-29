import { describe, expect, it } from 'vitest';
import {
  computeIsPoetApp,
  computeLockPoet,
  resolveActivePoetId,
} from './poetAppState';

describe('poetAppState', () => {
  it('prefers URL poet id over stored poet', () => {
    expect(
      resolveActivePoetId({
        urlPoetId: 3,
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

  it('locks poet when standalone with stored poet', () => {
    expect(
      computeLockPoet({
        isPoetApp: true,
        standalone: true,
        urlSource: null,
        resolvedUrlPoetId: null,
      }),
    ).toBe(true);
  });
});
