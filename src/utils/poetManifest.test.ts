import { describe, expect, it } from 'vitest';
import {
  buildPoetManifest,
  getPoetManifestUrl,
  isPoetManifestLocked,
  lockPoetManifestForInstall,
  unlockPoetManifestForInstall,
} from './poetManifest';

describe('poetManifest', () => {
  it('builds manifest with poet start_url', () => {
    const manifest = buildPoetManifest(
      { id: 1, name: 'حافظ' },
      '/icons/poets/1-192.png',
      '/icons/poets/1-512.png',
    );

    expect(manifest.short_name).toBe('حافظ');
    expect(manifest.start_url).toContain('/pwa/1/');
    expect(manifest.start_url).toContain('source=pwa');
    expect(manifest.scope).toContain('/pwa/1/');
    expect(manifest.icons).toHaveLength(3);
  });

  it('returns static manifest URL per poet', () => {
    expect(getPoetManifestUrl(42)).toContain('manifests/poet-42.webmanifest');
  });

  it('locks manifest during install flow', () => {
    unlockPoetManifestForInstall();
    expect(isPoetManifestLocked()).toBe(false);
    lockPoetManifestForInstall();
    expect(isPoetManifestLocked()).toBe(true);
    unlockPoetManifestForInstall();
    expect(isPoetManifestLocked()).toBe(false);
  });
});
