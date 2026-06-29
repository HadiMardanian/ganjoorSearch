import { findMatchRanges as coreFindMatchRanges } from '@/utils/matchCore';

const LETTER_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const HIGHLIGHT_NAME = 'ganjoor-search';

const owners = new Map<symbol, Range[]>();

export function supportsCssHighlightApi(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    'highlights' in CSS &&
    typeof Highlight !== 'undefined'
  );
}

export function findMatchRanges(text: string, term: string): Array<[number, number]> {
  return coreFindMatchRanges(text, term);
}

function isWholeWord(text: string, start: number, end: number): boolean {
  const before = start > 0 ? text[start - 1]! : ' ';
  const after = end < text.length ? text[end]! : ' ';
  return !LETTER_RE.test(before) && !LETTER_RE.test(after);
}

function expandToWord(text: string, start: number, end: number): [number, number] {
  let wordStart = start;
  let wordEnd = end;

  while (wordStart > 0 && LETTER_RE.test(text[wordStart - 1]!)) {
    wordStart -= 1;
  }

  while (wordEnd < text.length && LETTER_RE.test(text[wordEnd]!)) {
    wordEnd += 1;
  }

  return [wordStart, wordEnd];
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

/** HTML fallback: never split inside a Persian word — highlight the whole word instead. */
export function highlightTextHtml(text: string, term: string): string {
  if (!text || !term.trim()) return text;

  const matchRanges = findMatchRanges(text, term);
  if (matchRanges.length === 0) return text;

  const highlightRanges = mergeRanges(
    matchRanges.map(([start, end]) =>
      isWholeWord(text, start, end) ? [start, end] : expandToWord(text, start, end),
    ),
  );

  let result = '';
  let cursor = 0;

  for (const [start, end] of highlightRanges) {
    result += text.slice(cursor, start);
    result += `<span class="highlight">${text.slice(start, end)}</span>`;
    cursor = end;
  }

  result += text.slice(cursor);
  return result;
}

export function createTextRanges(
  textNode: Text,
  text: string,
  term: string,
): Range[] {
  return findMatchRanges(text, term).map(([start, end]) => {
    const range = new Range();
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    return range;
  });
}

export function setHighlightRanges(owner: symbol, ranges: Range[]): void {
  owners.set(owner, ranges);
  syncHighlightRegistry();
}

export function clearHighlightRanges(owner: symbol): void {
  owners.delete(owner);
  syncHighlightRegistry();
}

function syncHighlightRegistry(): void {
  if (!supportsCssHighlightApi()) return;

  const allRanges = [...owners.values()].flat();

  if (allRanges.length === 0) {
    CSS.highlights.delete(HIGHLIGHT_NAME);
    return;
  }

  CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...allRanges));
}

export { HIGHLIGHT_NAME };
