import { normalizePersian } from '@/utils/normalize';

export type ExcerptPart =
  | { type: 'line'; text: string }
  | { type: 'ellipsis' };

function queryPartsFromTerm(term: string): string[] {
  const trimmed = term.trim().replace(/"/g, '');
  if (!trimmed) return [];
  if (term.trim().startsWith('"') && term.trim().endsWith('"')) {
    return [trimmed];
  }
  return trimmed.split(/\s+/).filter(Boolean);
}

function lineMatchesPart(line: string, part: string): boolean {
  return normalizePersian(line).includes(normalizePersian(part));
}

/**
 * Builds a Ganjoor-style search excerpt: matching lines plus one line of
 * context before/after, with "..." between non-adjacent sections.
 */
export function buildSearchExcerpt(plainText: string, term: string): ExcerptPart[] {
  const parts = queryPartsFromTerm(term);
  const lines = plainText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0 || parts.length === 0) {
    return [];
  }

  const matchingIndices = new Set<number>();

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    for (const part of parts) {
      if (lineMatchesPart(line, part)) {
        if (index > 0) matchingIndices.add(index - 1);
        matchingIndices.add(index);
        if (index < lines.length - 1) matchingIndices.add(index + 1);
        break;
      }
    }
  }

  if (matchingIndices.size === 0) {
    return lines.slice(0, Math.min(3, lines.length)).map((text) => ({
      type: 'line' as const,
      text,
    }));
  }

  const sorted = [...matchingIndices].sort((a, b) => a - b);
  const excerpt: ExcerptPart[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const lineIndex = sorted[i]!;

    if (lineIndex > 0 && !matchingIndices.has(lineIndex - 1)) {
      excerpt.push({ type: 'ellipsis' });
    }

    excerpt.push({ type: 'line', text: lines[lineIndex]! });

    if (
      lineIndex < lines.length - 1 &&
      !matchingIndices.has(lineIndex + 1)
    ) {
      excerpt.push({ type: 'ellipsis' });
    }
  }

  return excerpt;
}
