import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPoetPwaInstalled } from '@/utils/poetPwaInstall';

function createStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe('isPoetPwaInstalled', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true only for the matching poet manifest id', async () => {
    vi.stubGlobal('navigator', {
      getInstalledRelatedApps: vi.fn().mockResolvedValue([
        {
          platform: 'webapp',
          id: '/ganjoorSearch/pwa/3',
          url: '/ganjoorSearch/manifests/poet-3.webmanifest',
        },
      ]),
    });

    expect(await isPoetPwaInstalled(3)).toBe(true);
    expect(await isPoetPwaInstalled(2)).toBe(false);
  });

  it('does not treat poet-23 as poet-2 via loose url match', async () => {
    vi.stubGlobal('navigator', {
      getInstalledRelatedApps: vi.fn().mockResolvedValue([
        {
          platform: 'webapp',
          id: '/ganjoorSearch/pwa/23',
          url: '/ganjoorSearch/manifests/poet-23.webmanifest',
        },
      ]),
    });

    expect(await isPoetPwaInstalled(2)).toBe(false);
    expect(await isPoetPwaInstalled(23)).toBe(true);
  });

  it('uses local record when getInstalledRelatedApps is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    localStorage.setItem('ganjoorsearch-installed-poet-ids', JSON.stringify([2]));
    expect(await isPoetPwaInstalled(2)).toBe(true);
    expect(await isPoetPwaInstalled(3)).toBe(false);
  });
});
