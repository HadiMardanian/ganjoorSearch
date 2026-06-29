import type { GroupedResult, Poem, SearchResult, Verse } from '@/types/ganjoor';
import { normalizePersian, textIncludesTerm } from '@/utils/normalize';

function getCoupletIndex(verse: Verse): number {
  return verse.coupletIndex ?? Math.floor(verse.vOrder / 2);
}

function syntheticVerse(poemId: number, lineIndex: number, text: string): Verse {
  return {
    id: poemId * 10_000 + lineIndex,
    vOrder: lineIndex,
    coupletIndex: Math.floor(lineIndex / 2),
    text,
  };
}

function linesFromPoem(poem: Poem): string[] {
  if (poem.plainText) {
    return poem.plainText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }

  if (poem.verses?.length) {
    return poem.verses.map((verse) => verse.text || '').filter(Boolean);
  }

  return [];
}

function buildVersesFromLines(poemId: number, lines: string[]): Verse[] {
  return lines.map((text, index) => syntheticVerse(poemId, index, text));
}

function buildMatchingCouplets(verses: Verse[], term: string) {
  const matchingLineIndices = new Set<number>();

  verses.forEach((verse, index) => {
    if (textIncludesTerm(verse.text, term)) {
      matchingLineIndices.add(index);
    }
  });

  if (matchingLineIndices.size === 0 && verses.length > 0) {
    matchingLineIndices.add(0);
  }

  const coupletIndices = new Set<number>();
  for (const lineIndex of matchingLineIndices) {
    coupletIndices.add(getCoupletIndex(verses[lineIndex]!));
  }

  return [...coupletIndices]
    .sort((a, b) => a - b)
    .map((coupletIndex) => ({
      coupletIndex,
      verses: verses
        .filter((verse) => getCoupletIndex(verse) === coupletIndex)
        .sort((a, b) => a.vOrder - b.vOrder),
    }));
}

export function mapSearchHitsToResults(items: Poem[], term: string): SearchResult[] {
  const results: SearchResult[] = [];

  for (const poem of items) {
    const lines = linesFromPoem(poem);
    const allVerses = buildVersesFromLines(poem.id, lines);
    const matchingCouplets = buildMatchingCouplets(allVerses, term);

    for (const couplet of matchingCouplets) {
      results.push({
        poemId: poem.id,
        poemTitle: poem.title || 'بدون عنوان',
        fullUrl: poem.fullUrl || `/hafez/ghazal/sh${poem.id}`,
        urlSlug: poem.urlSlug,
        matchingVerses: couplet.verses,
        allVerses,
        plainText: poem.plainText,
        htmlText: poem.htmlText,
        coupletIndex: couplet.coupletIndex,
      });
    }
  }

  return results;
}

export function mapSearchHitsToGrouped(items: Poem[], term: string): GroupedResult[] {
  return items.map((poem) => {
    const lines = linesFromPoem(poem);
    const allVerses = buildVersesFromLines(poem.id, lines);

    return {
      poemId: poem.id,
      poemTitle: poem.title || 'بدون عنوان',
      fullUrl: poem.fullUrl || `/hafez/ghazal/sh${poem.id}`,
      urlSlug: poem.urlSlug,
      allVerses,
      plainText: poem.plainText,
      htmlText: poem.htmlText,
      matchingCouplets: buildMatchingCouplets(allVerses, term),
    };
  });
}

export function enhanceGroupedWithVerses(
  result: GroupedResult,
  verses: Verse[],
  term: string,
): GroupedResult {
  if (!verses.length) return result;

  const sorted = [...verses].sort((a, b) => a.vOrder - b.vOrder);
  const normalizedTerm = normalizePersian(term);
  const matchingVerses = sorted.filter((verse) =>
    normalizePersian(verse.text || '').includes(normalizedTerm),
  );

  const coupletMap = new Map<number, Verse[]>();
  for (const verse of matchingVerses) {
    const index = getCoupletIndex(verse);
    const group = coupletMap.get(index) ?? [];
    group.push(verse);
    coupletMap.set(index, group);
  }

  const matchingCouplets =
    coupletMap.size > 0
      ? [...coupletMap.entries()]
          .sort(([a], [b]) => a - b)
          .map(([coupletIndex]) => ({
            coupletIndex,
            verses: sorted
              .filter((verse) => getCoupletIndex(verse) === coupletIndex)
              .sort((a, b) => a.vOrder - b.vOrder),
          }))
      : result.matchingCouplets;

  return {
    ...result,
    allVerses: sorted,
    matchingCouplets,
  };
}

export function countMatchingBits(results: GroupedResult[]): number {
  return results.reduce((sum, result) => sum + result.matchingCouplets.length, 0);
}
