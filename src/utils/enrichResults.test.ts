import { describe, expect, it, vi } from 'vitest';
import { enrichResultsWithFullText } from './enrichResults';
import type { GroupedResult } from '@/types/ganjoor';

vi.mock('@/api/ganjoor', () => ({
  fetchPoem: vi.fn(async (url: string) => ({
    plainText: `full text for ${url}`,
    verses: [],
  })),
}));

import { fetchPoem } from '@/api/ganjoor';

function sampleResult(overrides: Partial<GroupedResult> = {}): GroupedResult {
  return {
    poemId: 1,
    poemTitle: 'غزل',
    fullTitle: 'حافظ » غزلیات » شماره ۱',
    fullUrl: '/hafez/ghazal/sh1',
    allVerses: [],
    excerpt: [],
    matchingCouplets: [],
    plainText: 'short search snippet',
    ...overrides,
  };
}

describe('enrichResultsWithFullText', () => {
  it('replaces plainText with fetched poem text', async () => {
    const results = await enrichResultsWithFullText([sampleResult()]);
    expect(results[0]?.plainText).toBe('full text for /hafez/ghazal/sh1');
    expect(fetchPoem).toHaveBeenCalledWith('/hafez/ghazal/sh1', undefined);
  });

  it('reports progress', async () => {
    const progress: number[] = [];
    await enrichResultsWithFullText([sampleResult(), sampleResult({ poemId: 2 })], {
      onProgress: (loaded) => progress.push(loaded),
    });
    expect(progress).toEqual([1, 2]);
  });
});
