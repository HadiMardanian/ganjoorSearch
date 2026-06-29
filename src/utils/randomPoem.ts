import { fetchCategoryDetail, fetchPoetDetail } from '@/api/ganjoor';

export interface RandomPoemResult {
  poemUrl: string;
  title: string;
  categoryTitle?: string;
}

async function findRandomPoemInCategory(
  categoryId: number,
  categoryTitle: string,
  signal?: AbortSignal,
  depth = 0,
): Promise<RandomPoemResult | null> {
  if (depth > 4) return null;

  const category = await fetchCategoryDetail(categoryId, { withPoems: true, signal });

  if (category.poems.length > 0) {
    const poem = category.poems[Math.floor(Math.random() * category.poems.length)]!;
    if (poem.fullUrl) {
      return {
        poemUrl: poem.fullUrl,
        title: poem.title,
        categoryTitle,
      };
    }
  }

  if (category.children.length === 0) return null;

  const shuffled = [...category.children].sort(() => Math.random() - 0.5);
  for (const child of shuffled.slice(0, 4)) {
    const found = await findRandomPoemInCategory(child.id, child.title, signal, depth + 1);
    if (found) return found;
  }

  return null;
}

export async function pickRandomPoem(
  poetId: number,
  signal?: AbortSignal,
): Promise<RandomPoemResult | null> {
  const detail = await fetchPoetDetail(poetId, signal);
  const children = detail.rootCategory.children;
  if (children.length === 0) return null;

  const shuffled = [...children].sort(() => Math.random() - 0.5);
  for (const category of shuffled.slice(0, 5)) {
    const found = await findRandomPoemInCategory(category.id, category.title, signal);
    if (found) return found;
  }

  return null;
}
