import type { Verse } from '@/types/ganjoor';

export function poemToLines(poem: {
  verses?: Array<{ text?: string }>;
  htmlText?: string;
  plainText?: string;
}): string[] {
  if (poem.verses?.length) {
    return poem.verses.map((verse) => verse.text || '').filter(Boolean);
  }

  if (poem.htmlText) {
    const stripped = poem.htmlText
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\r/g, '');
    return stripped
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return poem.plainText?.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) ?? [];
}

export interface CoupletGroup {
  coupletIndex: number;
  lines: string[];
}

export function poemToCouplets(verses?: Verse[]): CoupletGroup[] {
  if (!verses?.length) return [];

  const groups = new Map<number, string[]>();

  for (const verse of verses) {
    const text = verse.text?.trim();
    if (!text) continue;
    const index = verse.coupletIndex ?? Math.floor((verse.vOrder - 1) / 2);
    const bucket = groups.get(index) ?? [];
    bucket.push(text);
    groups.set(index, bucket);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([coupletIndex, lines]) => ({ coupletIndex, lines }));
}

export function linesToCouplets(lines: string[]): CoupletGroup[] {
  const groups: CoupletGroup[] = [];
  for (let i = 0; i < lines.length; i += 2) {
    groups.push({
      coupletIndex: Math.floor(i / 2),
      lines: lines.slice(i, i + 2),
    });
  }
  return groups;
}
