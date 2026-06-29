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

export function normalizePersian(text: string): string {
  let normalized = text.normalize('NFC').toLowerCase();

  for (const [arabic, persian] of Object.entries(ARABIC_TO_PERSIAN)) {
    normalized = normalized.replaceAll(arabic, persian);
  }

  return normalized.replace(/\u200c/g, '');
}

export function textIncludesTerm(text: string, term: string): boolean {
  if (!text || !term) return false;
  return normalizePersian(text).includes(normalizePersian(term));
}
