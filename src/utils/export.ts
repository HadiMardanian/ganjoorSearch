import { GANJOOR_SITE } from '@/api/client';
import { formatDisplayTitle } from '@/utils/displayTitle';
import type { GroupedResult, ViewMode } from '@/types/ganjoor';

export type ExportFormat = 'csv' | 'excel';

export const VERSE_EXPORT_HEADERS = ['عنوان', 'بیت۱', 'بیت۲', 'لینک'] as const;
export const FULL_EXPORT_HEADERS = ['عنوان', 'متن', 'لینک'] as const;

export function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function escapeXml(value: string): string {
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildExcelSpreadsheet(headers: string[], rows: string[][]): string {
  const headerCells = headers
    .map(
      (header) =>
        `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`,
    )
    .join('');

  const dataRows = rows
    .map((row) => {
      const cells = row
        .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`)
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Results">
  <Table>
   <Row>${headerCells}</Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

function getPoemText(result: GroupedResult): string {
  if (result.plainText) return result.plainText;
  return (result.allVerses ?? [])
    .map((verse) => verse.text || '')
    .filter(Boolean)
    .join('\n');
}

function displayTitle(result: GroupedResult): string {
  return formatDisplayTitle(result.fullTitle || result.poemTitle);
}

export function buildVerseExportRows(results: GroupedResult[]): string[][] {
  const rows: string[][] = [];

  for (const result of results) {
    if (result.matchingCouplets.length === 0) {
      if (result.titleOnlyMatch) {
        rows.push([
          displayTitle(result),
          result.excerpt.find((part) => part.type === 'note')?.text ?? displayTitle(result),
          '',
          result.fullUrl ? `${GANJOOR_SITE}${result.fullUrl}` : '',
        ]);
      }
      continue;
    }

    for (const couplet of result.matchingCouplets) {
      const lines = couplet.verses.map((verse) => verse.text || '');
      rows.push([
        displayTitle(result),
        lines[0] ?? '',
        lines[1] ?? lines[0] ?? '',
        result.fullUrl ? `${GANJOOR_SITE}${result.fullUrl}` : '',
      ]);
    }
  }

  return rows;
}

export function buildFullExportRows(results: GroupedResult[]): string[][] {
  return results
    .map((result) => [
      displayTitle(result),
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
  const xml = buildExcelSpreadsheet(headers, rows);

  downloadBlob(
    filename,
    new Blob(['\uFEFF', xml], {
      type: 'application/vnd.ms-excel',
    }),
  );
}

export function exportResults(
  results: GroupedResult[],
  mode: ViewMode,
  format: ExportFormat = 'csv',
): { success: boolean; rowCount: number } {
  const headers =
    mode === 'verse' ? [...VERSE_EXPORT_HEADERS] : [...FULL_EXPORT_HEADERS];

  const rows = mode === 'verse' ? buildVerseExportRows(results) : buildFullExportRows(results);

  if (rows.length === 0) return { success: false, rowCount: 0 };

  const baseName = mode === 'verse' ? 'verse-results' : 'full-results';
  const filename =
    format === 'excel' ? `${baseName}.xls` : `${baseName}.csv`;

  if (format === 'excel') {
    downloadExcel(filename, headers, rows);
  } else {
    downloadCsv(filename, headers, rows);
  }

  return { success: true, rowCount: rows.length };
}
