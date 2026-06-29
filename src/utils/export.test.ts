import { describe, expect, it } from 'vitest';
import { buildVerseExportRows, escapeCsv } from './export';
import type { GroupedResult } from '@/types/ganjoor';

function sampleResult(overrides: Partial<GroupedResult> = {}): GroupedResult {
  return {
    poemId: 1,
    poemTitle: 'غزل',
    fullTitle: 'حافظ » غزلیات » شماره ۱',
    fullUrl: '/hafez/ghazal/sh1',
    allVerses: [],
    excerpt: [{ type: 'line', text: 'جام می‌ده' }],
    matchingCouplets: [
      {
        coupletIndex: 0,
        verses: [
          { id: 1, vOrder: 0, text: 'جام می‌ده' },
          { id: 2, vOrder: 1, text: 'و باده ده' },
        ],
      },
    ],
    ...overrides,
  };
}

describe('export', () => {
  it('escapes csv values', () => {
    expect(escapeCsv('سلام, دنیا')).toBe('"سلام, دنیا"');
  });

  it('exports verse rows from matching couplets', () => {
    const rows = buildVerseExportRows([sampleResult()]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.[1]).toBe('جام می‌ده');
    expect(rows[0]?.[2]).toBe('و باده ده');
  });

  it('exports title-only match note', () => {
    const rows = buildVerseExportRows([
      sampleResult({
        matchingCouplets: [],
        titleOnlyMatch: true,
        excerpt: [{ type: 'note', text: 'تطابق در عنوان: حافظ » غزلیات' }],
      }),
    ]);
    expect(rows[0]?.[1]).toContain('تطابق در عنوان');
  });
});
