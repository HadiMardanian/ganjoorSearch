import { describe, expect, it } from 'vitest';
import { buildPoetInstallUrl } from '@/utils/poetInstallUrl';

describe('buildPoetInstallUrl', () => {
  it('uses main app path with install query params', () => {
    expect(buildPoetInstallUrl(2)).toBe('/ganjoorSearch?install=1&poet=2');
    expect(buildPoetInstallUrl(43)).toBe('/ganjoorSearch?install=1&poet=43');
  });
});
