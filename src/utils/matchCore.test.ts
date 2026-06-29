import { describe, expect, it } from 'vitest';
import {
  findMatchRanges,
  findMatchingLineIndices,
  lineMatches,
  parseQuery,
} from './matchCore';

describe('matchCore', () => {
  it('parses quoted phrase', () => {
    expect(parseQuery('"جام می"')).toEqual({
      parts: ['جام می'],
      isQuotedPhrase: true,
    });
  });

  it('parses OR tokens', () => {
    expect(parseQuery('جام می')).toEqual({
      parts: ['جام', 'می'],
      isQuotedPhrase: false,
    });
  });

  it('matches Arabic and Persian variants', () => {
    const query = parseQuery('جام');
    expect(lineMatches('با كاسه جام باده', query)).toBe(true);
    expect(lineMatches('با کاسه می', query)).toBe(false);
  });

  it('finds highlight ranges across variants', () => {
    const ranges = findMatchRanges('شد ماه به جامت', 'جام');
    expect(ranges.length).toBeGreaterThan(0);
    expect('شد ماه به جامت'.slice(ranges[0]![0], ranges[0]![1])).toContain('جام');
  });

  it('finds matching line indices with OR query', () => {
    const lines = ['خط اول', 'جام باده', 'می خور'];
    const indices = findMatchingLineIndices(lines, parseQuery('جام می'));
    expect(indices.has(1)).toBe(true);
    expect(indices.has(2)).toBe(true);
  });

  it('matches quoted phrase as contiguous text on one line', () => {
    const query = parseQuery('"جام می"');
    expect(lineMatches('بیا جام می نوش', query)).toBe(true);
    expect(lineMatches('جام باده می خور', query)).toBe(false);
  });

  it('matches quoted phrase across adjacent lines', () => {
    const lines = ['بیا جام', 'می نوش'];
    const indices = findMatchingLineIndices(lines, parseQuery('"جام می"'));
    expect(indices.has(0)).toBe(true);
    expect(indices.has(1)).toBe(true);
  });
});
