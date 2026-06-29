import { normalizePersian } from '@/utils/normalize';

const ARABIC_TO_PERSIAN: Record<string, string> = {
  'ي': 'ی',
  'ك': 'ک',
  'ة': 'ه',
  'ؤ': 'و',
  'إ': 'ا',
  'أ': 'ا',
  'ٱ': 'ا',
  'ئ': 'ی',
};

export interface ParsedQuery {
  parts: string[];
  isQuotedPhrase: boolean;
}

export function parseQuery(term: string): ParsedQuery {
  const trimmed = term.trim();
  if (!trimmed) return { parts: [], isQuotedPhrase: false };

  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return { parts: [trimmed.slice(1, -1)], isQuotedPhrase: true };
  }

  return { parts: trimmed.split(/\s+/).filter(Boolean), isQuotedPhrase: false };
}

export function lineMatches(line: string, query: ParsedQuery): boolean {
  if (!line || query.parts.length === 0) return false;
  const normalizedLine = normalizePersian(line);
  return query.parts.some((part) => normalizedLine.includes(normalizePersian(part)));
}

export function textMatches(text: string, query: ParsedQuery): boolean {
  if (!text || query.parts.length === 0) return false;
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .some((line) => lineMatches(line, query));
}

export function titleMatches(title: string, query: ParsedQuery): boolean {
  return lineMatches(title, query);
}

function buildNormalizedMap(text: string): { normalized: string; toOriginal: number[] } {
  const nfc = text.normalize('NFC');
  const toOriginal: number[] = [];
  let normalized = '';

  for (let i = 0; i < nfc.length; i++) {
    let char = nfc[i]!.toLowerCase();
    char = ARABIC_TO_PERSIAN[char] ?? char;
    if (char === '\u200c') continue;
    normalized += char;
    toOriginal.push(i);
  }

  return { normalized, toOriginal };
}

function findPartRanges(text: string, part: string): Array<[number, number]> {
  const normPart = normalizePersian(part);
  if (!normPart) return [];

  const { normalized, toOriginal } = buildNormalizedMap(text);
  const ranges: Array<[number, number]> = [];
  let index = 0;

  while (index < normalized.length) {
    const found = normalized.indexOf(normPart, index);
    if (found === -1) break;

    const origStart = toOriginal[found] ?? 0;
    const lastNormIndex = found + normPart.length - 1;
    const origEnd = (toOriginal[lastNormIndex] ?? origStart) + 1;
    ranges.push([origStart, origEnd]);
    index = found + normPart.length;
  }

  return ranges;
}

function mergeRanges(ranges: Array<[number, number]>): Array<[number, number]> {
  if (ranges.length === 0) return [];

  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [sorted[0]!];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i]!;
    const last = merged[merged.length - 1]!;

    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

export function findMatchRanges(text: string, term: string): Array<[number, number]> {
  const query = parseQuery(term);
  if (!text || query.parts.length === 0) return [];

  const allRanges = query.parts.flatMap((part) => findPartRanges(text, part));
  return mergeRanges(allRanges);
}

export function findMatchingLineIndices(lines: string[], query: ParsedQuery): Set<number> {
  const indices = new Set<number>();

  for (let index = 0; index < lines.length; index++) {
    if (lineMatches(lines[index]!, query)) {
      indices.add(index);
    }
  }

  return indices;
}

export function expandIndicesWithContext(
  indices: Set<number>,
  lineCount: number,
  contextLines = 1,
): Set<number> {
  const expanded = new Set<number>();

  for (const index of indices) {
    for (let offset = -contextLines; offset <= contextLines; offset += 1) {
      const next = index + offset;
      if (next >= 0 && next < lineCount) {
        expanded.add(next);
      }
    }
  }

  return expanded;
}
