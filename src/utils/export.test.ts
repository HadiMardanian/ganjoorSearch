import { describe, expect, it } from 'vitest';
import {
  buildExportFilename,
  buildFullExportRows,
  buildVerseExportRows,
  escapeCsv,
  FULL_EXPORT_HEADERS,
  VERSE_EXPORT_HEADERS,
} from './export';
import type { GroupedResult } from '@/types/ganjoor';

function sampleResult(overrides: Partial<GroupedResult> = {}): GroupedResult {
  return {
    poemId: 1,
    poemTitle: 'غزل',
    fullTitle: 'حافظ » غزلیات » شماره ۱',
    fullUrl: '/hafez/ghazal/sh1',
    allVerses: [],
    excerpt: [
      { type: 'line', text: 'جام می‌ده' },
      { type: 'line', text: 'و باده ده' },
    ],
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

  it('exports verse rows from excerpt lines', () => {
    const rows = buildVerseExportRows([sampleResult()]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.[1]).toBe('جام می‌ده');
    expect(rows[0]?.[2]).toBe('و باده ده');
  });

  it('exports verse from excerpt not full matching couplets', () => {
    const rows = buildVerseExportRows([
      sampleResult({
        excerpt: [
          { type: 'line', text: 'جام می‌ده' },
          { type: 'line', text: 'و باده ده' },
        ],
        matchingCouplets: [
          {
            coupletIndex: 0,
            verses: Array.from({ length: 20 }, (_, i) => ({
              id: i,
              vOrder: i,
              text: `بیت کامل شماره ${i}`,
            })),
          },
        ],
        plainText: Array.from({ length: 20 }, (_, i) => `بیت کامل شماره ${i}`).join('\n'),
      }),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.[1]).toBe('جام می‌ده');
    expect(rows[0]?.[2]).toBe('و باده ده');
    expect(rows[0]?.[1]).not.toContain('بیت کامل شماره ۵');
  });

  it('keeps متن column only in full export', () => {
    expect(VERSE_EXPORT_HEADERS).not.toContain('متن');
    expect(FULL_EXPORT_HEADERS).toContain('متن');

    const result = sampleResult({
      plainText: 'جام می‌ده\nو باده ده\nبیت سوم طولانی',
      excerpt: [{ type: 'line', text: 'جام می‌ده' }],
    });

    const verseRows = buildVerseExportRows([result]);
    const fullRows = buildFullExportRows([result]);

    expect(verseRows[0]?.[1]).toBe('جام می‌ده');
    expect(verseRows[0]?.[1]).not.toContain('بیت سوم');
    expect(fullRows[0]?.[1]).toContain('بیت سوم طولانی');
  });

  it('builds filename from search term', () => {
    expect(buildExportFilename('جام', 'verse', 'csv')).toBe('جام-verse-results.csv');
    expect(buildExportFilename('جام می', 'full', 'excel')).toContain('full-results.xls');
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
