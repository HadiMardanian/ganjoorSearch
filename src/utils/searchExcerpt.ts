import {
  expandIndicesWithContext,
  findMatchingLineIndices,
  parseQuery,
  type ParsedQuery,
} from '@/utils/matchCore';

export type ExcerptPart =
  | { type: 'line'; text: string }
  | { type: 'ellipsis' }
  | { type: 'note'; text: string };

function buildExcerptFromIndices(lines: string[], indices: Set<number>): ExcerptPart[] {
  if (indices.size === 0) {
    return lines.slice(0, Math.min(3, lines.length)).map((text) => ({
      type: 'line' as const,
      text,
    }));
  }

  const sorted = [...indices].sort((a, b) => a - b);
  const excerpt: ExcerptPart[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const lineIndex = sorted[i]!;

    if (i > 0 && lineIndex - sorted[i - 1]! > 1) {
      excerpt.push({ type: 'ellipsis' });
    }

    excerpt.push({ type: 'line', text: lines[lineIndex]! });
  }

  return excerpt;
}

export function buildSearchExcerpt(plainText: string, term: string): ExcerptPart[] {
  const query = parseQuery(term);
  const lines = plainText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0 || query.parts.length === 0) {
    return [];
  }

  const matchingIndices = findMatchingLineIndices(lines, query);
  const displayIndices = expandIndicesWithContext(matchingIndices, lines.length, 1);

  return buildExcerptFromIndices(lines, displayIndices);
}

export function buildTitleMatchNote(title: string): ExcerptPart[] {
  return [{ type: 'note', text: `تطابق در عنوان: ${title}` }];
}

export function excerptLinesForExport(excerpt: ExcerptPart[]): string[] {
  return excerpt.filter((part) => part.type === 'line').map((part) => part.text);
}

export function getQueryFromTerm(term: string): ParsedQuery {
  return parseQuery(term);
}
