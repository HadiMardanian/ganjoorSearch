import { fetchPoem } from '@/api/ganjoor';
import type { GroupedResult, Poem } from '@/types/ganjoor';
import { mapWithConcurrency } from '@/utils/parallel';

function poemToPlainText(poem: Poem): string {
  if (poem.plainText) return poem.plainText;
  if (poem.verses?.length) {
    return poem.verses
      .map((verse) => verse.text || '')
      .filter(Boolean)
      .join('\n');
  }
  if (poem.htmlText) {
    return poem.htmlText
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
  return '';
}

export async function enrichResultsWithFullText(
  results: GroupedResult[],
  options: {
    signal?: AbortSignal;
    concurrency?: number;
    onProgress?: (loaded: number, total: number) => void;
  } = {},
): Promise<GroupedResult[]> {
  const { signal, concurrency = 4, onProgress } = options;
  const total = results.length;
  let loaded = 0;

  return mapWithConcurrency(results, concurrency, async (result) => {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (!result.fullUrl) {
      loaded += 1;
      onProgress?.(loaded, total);
      return result;
    }

    try {
      const poem = await fetchPoem(result.fullUrl, signal);
      const plainText = poemToPlainText(poem);
      loaded += 1;
      onProgress?.(loaded, total);
      return plainText ? { ...result, plainText } : result;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      loaded += 1;
      onProgress?.(loaded, total);
      return result;
    }
  });
}
