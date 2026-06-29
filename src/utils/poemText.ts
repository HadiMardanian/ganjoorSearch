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
