import type { GroupedResult, Poem, Verse } from '@/types/ganjoor';
import { buildPoetImageUrl } from '@/api/client';
import {
  buildSearchExcerpt,
  buildTitleMatchNote,
  getQueryFromTerm,
} from '@/utils/searchExcerpt';
import {
  findMatchingLineIndices,
  parseQuery,
  textMatches,
  titleMatches,
} from '@/utils/matchCore';

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

function buildMatchingCouplets(verses: Verse[], query: ReturnType<typeof parseQuery>) {
  const matchingLineIndices = findMatchingLineIndices(
    verses.map((verse) => verse.text || ''),
    query,
  );

  if (matchingLineIndices.size === 0) {
    return [];
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

export function mapSearchHitsToGrouped(items: Poem[], term: string): GroupedResult[] {
  const query = getQueryFromTerm(term);

  return items.map((poem) => {
    const lines = linesFromPoem(poem);
    const allVerses = buildVersesFromLines(poem.id, lines);
    const plainText = poem.plainText ?? lines.join('\n');
    const fullTitle = poem.fullTitle || poem.title || 'بدون عنوان';
    const bodyMatch = textMatches(plainText, query);
    const titleOnlyMatch = !bodyMatch && titleMatches(fullTitle, query);

    const excerpt = titleOnlyMatch
      ? buildTitleMatchNote(fullTitle)
      : buildSearchExcerpt(plainText, term);

    const poet = poem.category?.poet;

    return {
      poemId: poem.id,
      poemTitle: poem.title || 'بدون عنوان',
      fullTitle,
      fullUrl: poem.fullUrl || '',
      urlSlug: poem.urlSlug,
      poetId: poet?.id,
      poetName: poet?.name,
      poetImageUrl: buildPoetImageUrl(poet?.imageUrl),
      allVerses,
      plainText,
      htmlText: poem.htmlText,
      excerpt,
      matchingCouplets: buildMatchingCouplets(allVerses, query),
      titleOnlyMatch,
    };
  });
}

export function countMatchingBits(results: GroupedResult[]): number {
  return results.reduce((sum, result) => sum + result.matchingCouplets.length, 0);
}
