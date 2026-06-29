import { GANJOOR_SITE } from '@/api/client';
import type { GroupedResult, ViewMode } from '@/types/ganjoor';

export type ExportFormat = 'csv' | 'excel';

export function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getPoemText(result: GroupedResult): string {
  if (result.plainText) return result.plainText;
  return (result.allVerses ?? [])
    .map((verse) => verse.text || '')
    .filter(Boolean)
    .join('\n');
}

export function buildVerseExportRows(results: GroupedResult[]): string[][] {
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

  return rows;
}

export function buildFullExportRows(results: GroupedResult[]): string[][] {
  return results
    .map((result) => [
      result.poemTitle,
      getPoemText(result),
      result.fullUrl ? `${GANJOOR_SITE}${result.fullUrl}` : '',
    ])
    .filter((row) => row[0] || row[1]);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const content = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');

  downloadBlob(
    filename,
    new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' }),
  );
}

function downloadExcel(filename: string, headers: string[], rows: string[][]) {
  const tableRows = [
    `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`,
    ...rows.map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
    ),
  ].join('');

  const html = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8" /></head>
<body><table>${tableRows}</table></body></html>`;

  downloadBlob(
    filename,
    new Blob([`\uFEFF${html}`], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    }),
  );
}

export function exportResults(
  results: GroupedResult[],
  mode: ViewMode,
  format: ExportFormat = 'csv',
) {
  const headers =
    mode === 'verse'
      ? ['title', 'line1', 'line2', 'url']
      : ['title', 'poem', 'url'];

  const rows = mode === 'verse' ? buildVerseExportRows(results) : buildFullExportRows(results);

  if (rows.length === 0) return false;

  const baseName = mode === 'verse' ? 'verse-results' : 'ghazal-results';
  const filename =
    format === 'excel' ? `${baseName}.xls` : `${baseName}.csv`;

  if (format === 'excel') {
    downloadExcel(filename, headers, rows);
  } else {
    downloadCsv(filename, headers, rows);
  }

  return true;
}
