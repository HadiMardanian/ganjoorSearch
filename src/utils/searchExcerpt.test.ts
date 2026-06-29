import { describe, expect, it } from 'vitest';
import { buildSearchExcerpt } from './searchExcerpt';

describe('searchExcerpt', () => {
  it('includes context around match', () => {
    const text =
      'چون روز علم زند به نامت ماند\nچون یک شبه شد ماه به جامت ماند\nتقدیر به عزم تیز گامت ماند';
    const excerpt = buildSearchExcerpt(text, 'جام');
    const lines = excerpt.filter((part) => part.type === 'line').map((part) => part.text);
    expect(lines.some((line) => line.includes('جامت'))).toBe(true);
  });

  it('uses single ellipsis between non-adjacent sections', () => {
    const text = 'جام اول\nخط۲\nخط۳\nخط۴\nپنج\nجام شش';
    const excerpt = buildSearchExcerpt(text, 'جام');
    const ellipses = excerpt.filter((part) => part.type === 'ellipsis');
    expect(ellipses.length).toBe(1);
  });
});
