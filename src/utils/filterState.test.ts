import { describe, expect, it } from 'vitest';
import {
  formatIdListParam,
  parseIdListParam,
  toggleFilterId,
} from './filterState';

describe('filterState', () => {
  it('parses comma-separated ids', () => {
    expect(parseIdListParam('2,3')).toEqual([2, 3]);
    expect(parseIdListParam('all')).toBe('all');
  });

  it('formats id lists', () => {
    expect(formatIdListParam([1, 2])).toBe('1,2');
    expect(formatIdListParam('all')).toBeNull();
  });

  it('toggles filter ids', () => {
    expect(toggleFilterId('all', 2)).toEqual([2]);
    expect(toggleFilterId([2], 2)).toBe('all');
    expect(toggleFilterId([2], 3)).toEqual([2, 3]);
  });
});
