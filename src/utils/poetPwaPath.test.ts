import { describe, expect, it } from 'vitest';
import {
  buildPoetPwaStartUrl,
  getPoetPwaManifestId,
  getPoetPwaScopePath,
  parsePoetIdFromPwaPath,
} from './poetPwaPath';

const BASE = import.meta.env.BASE_URL || '/';

describe('poetPwaPath', () => {
  it('builds non-overlapping scope paths per poet', () => {
    expect(getPoetPwaScopePath(2)).toBe(`${BASE}pwa/2/`);
    expect(getPoetPwaScopePath(43)).toBe(`${BASE}pwa/43/`);
    expect(getPoetPwaScopePath(2)).not.toBe(getPoetPwaScopePath(43));
  });

  it('builds start_url under poet scope', () => {
    expect(buildPoetPwaStartUrl(2)).toBe(`${BASE}pwa/2/?source=pwa&tab=browse`);
  });

  it('parses poet id from PWA path', () => {
    expect(parsePoetIdFromPwaPath(`${BASE.replace(/\/$/, '')}/pwa/43/`)).toBe(43);
    expect(parsePoetIdFromPwaPath('/ganjoorSearch/pwa/2')).toBe(2);
    expect(parsePoetIdFromPwaPath('/ganjoorSearch/')).toBeNull();
  });

  it('uses stable manifest id per poet path', () => {
    expect(getPoetPwaManifestId(15)).toBe(`${BASE.replace(/\/$/, '')}/pwa/15`);
  });
});
