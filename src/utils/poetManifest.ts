import type { Poet } from '@/types/ganjoor';
import { resolveManifestIconUrls } from '@/utils/poetIcon';
import {
  buildPoetPwaStartUrl,
  getPoetPwaManifestId,
  getPoetPwaScopePath,
} from '@/utils/poetPwaPath';

const BASE = import.meta.env.BASE_URL;
const MANIFEST_LINK_ID = 'app-manifest';
const APPLE_TITLE_ID = 'apple-mobile-web-app-title';
const APPLE_ICON_ID = 'apple-touch-icon';

export interface PoetManifest {
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: string;
  dir: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
  related_applications?: Array<{ platform: string; url: string; id: string }>;
}

let manifestObjectUrl: string | null = null;
let appleIconObjectUrl: string | null = null;
let manifestInstallLock = false;
let activePoetManifestId: number | null = null;

function revokeIfBlob(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

export function getPoetManifestUrl(poetId: number): string {
  return `${BASE}manifests/poet-${poetId}.webmanifest`;
}

export function lockPoetManifestForInstall(): void {
  manifestInstallLock = true;
}

export function unlockPoetManifestForInstall(): void {
  manifestInstallLock = false;
}

export function isPoetManifestLocked(): boolean {
  return manifestInstallLock;
}

export function buildPoetManifest(
  poet: Poet,
  icon192: string,
  icon512: string,
): PoetManifest {
  const poetName = poet.name || poet.fullName || 'شاعر';
  return {
    id: getPoetPwaManifestId(poet.id),
    name: `${poetName} — گنجورسرچ`,
    short_name: poetName,
    description: `جستجوی اشعار ${poetName} با گنجورسرچ`,
    lang: 'fa',
    dir: 'rtl',
    start_url: buildPoetPwaStartUrl(poet.id),
    scope: getPoetPwaScopePath(poet.id),
    display: 'standalone',
    background_color: '#f7f4ef',
    theme_color: '#9a3412',
    related_applications: [
      {
        platform: 'webapp',
        url: getPoetManifestUrl(poet.id),
        id: getPoetPwaManifestId(poet.id),
      },
    ],
    icons: [
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

function ensureMeta(name: string, id: string, content: string) {
  let el = document.getElementById(id) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.id = id;
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function ensureLink(rel: string, id: string, href: string) {
  let el = document.getElementById(id) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.id = id;
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

async function checkStaticManifestExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

function applyPoetManifestMeta(poet: Poet, icon192: string): void {
  const poetName = poet.name || poet.fullName || 'شاعر';
  ensureMeta('apple-mobile-web-app-title', APPLE_TITLE_ID, poetName);
  ensureLink('apple-touch-icon', APPLE_ICON_ID, icon192);
  revokeIfBlob(appleIconObjectUrl);
  appleIconObjectUrl = null;
  document.title = `${poetName} — گنجورسرچ`;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#9a3412';
    document.head.appendChild(meta);
  } else {
    themeMeta.setAttribute('content', '#9a3412');
  }
}

export async function injectPoetManifest(poet: Poet): Promise<void> {
  if (activePoetManifestId === poet.id && !manifestObjectUrl) {
    const link = document.getElementById(MANIFEST_LINK_ID) as HTMLLinkElement | null;
    if (link?.href.includes(`poet-${poet.id}.webmanifest`)) return;
  }

  const { icon192, icon512 } = await resolveManifestIconUrls(poet.id);
  const staticManifestUrl = getPoetManifestUrl(poet.id);
  const hasStaticManifest = await checkStaticManifestExists(staticManifestUrl);

  revokeIfBlob(manifestObjectUrl);
  manifestObjectUrl = null;

  if (hasStaticManifest) {
    ensureLink('manifest', MANIFEST_LINK_ID, staticManifestUrl);
  } else {
    const manifest = buildPoetManifest(poet, icon192, icon512);
    manifestObjectUrl = URL.createObjectURL(
      new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }),
    );
    ensureLink('manifest', MANIFEST_LINK_ID, manifestObjectUrl);
  }

  applyPoetManifestMeta(poet, icon192);
  activePoetManifestId = poet.id;
}

export function restoreDefaultManifest(): void {
  if (manifestInstallLock) return;

  revokeIfBlob(manifestObjectUrl);
  manifestObjectUrl = null;
  revokeIfBlob(appleIconObjectUrl);
  appleIconObjectUrl = null;
  activePoetManifestId = null;

  ensureLink('manifest', MANIFEST_LINK_ID, `${BASE}manifest.webmanifest`);
  const titleMeta = document.getElementById(APPLE_TITLE_ID);
  titleMeta?.remove();
  const iconLink = document.getElementById(APPLE_ICON_ID);
  iconLink?.remove();
}
