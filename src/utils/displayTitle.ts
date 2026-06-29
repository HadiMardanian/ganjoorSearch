/** «شاعر » قالب » عنوان» → «شاعر » عنوان» */
export function formatDisplayTitle(fullTitle: string): string {
  const parts = fullTitle
    .split('»')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return `${parts[0]} » ${parts[parts.length - 1]}`;
  }

  return fullTitle;
}
