import { GANJOOR_SITE } from '@/api/client';
import type { GroupedResult } from '@/types/ganjoor';
import type { ViewMode } from '@/types/ganjoor';

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const content = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportResults(results: GroupedResult[], mode: ViewMode) {
  if (mode === 'verse') {
    const rows: string[][] = [];

    for (const result of results) {
      for (const couplet of result.matchingCouplets) {
        const lines = couplet.verses.map((verse) => verse.text || '');
        rows.push([
          result.poemTitle,
          lines[0] ?? '',
          lines[1] ?? '',
          result.fullUrl ? `${GANJOOR_SITE}${result.fullUrl}` : '',
        ]);
      }
    }

    if (rows.length === 0) return false;

    downloadCsv(
      'verse-results.csv',
      ['title', 'line1', 'line2', 'url'],
      rows,
    );
    return true;
  }

  const rows = results
    .map((result) => {
      const poem =
        result.plainText ??
        (result.allVerses?.length
          ? result.allVerses
              .map((verse) => verse.text || '')
              .filter(Boolean)
              .join('\n')
          : '');

      return [
        result.poemTitle,
        poem,
        result.fullUrl ? `${GANJOOR_SITE}${result.fullUrl}` : '',
      ];
    })
    .filter((row) => row[0] || row[1]);

  if (rows.length === 0) return false;

  downloadCsv('ghazal-results.csv', ['title', 'poem', 'url'], rows);
  return true;
}
