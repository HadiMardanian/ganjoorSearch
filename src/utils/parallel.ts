import pLimit from 'p-limit';

const DEFAULT_CONCURRENCY = 5;

export function createLimiter(concurrency = DEFAULT_CONCURRENCY) {
  return pLimit(concurrency);
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const limit = createLimiter(concurrency);
  return Promise.all(items.map((item, index) => limit(() => mapper(item, index))));
}
