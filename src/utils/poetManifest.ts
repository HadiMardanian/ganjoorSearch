import type { Poet } from '@/types/ganjoor';
import { resolveManifestIconUrls } from '@/utils/poetIcon';

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
}

let manifestObjectUrl: string | null = null;
let appleIconObjectUrl: string | null = null;

function revokeIfBlob(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

export function buildPoetManifest(
  poet: Poet,
  icon192: string,
  icon512: string,
): PoetManifest {
  const poetName = poet.name || poet.fullName || 'شاعر';
  return {
    id: `${BASE}poet-app/${poet.id}`,
    name: `${poetName} — گنجورسرچ`,
    short_name: poetName,
    description: `جستجوی اشعار ${poetName} با گنجورسرچ`,
    lang: 'fa',
    dir: 'rtl',
    start_url: `${BASE}?poet=${poet.id}&source=pwa&tab=browse`,
    scope: BASE,
    display: 'standalone',
    background_color: '#f7f4ef',
    theme_color: '#9a3412',
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

export async function injectPoetManifest(poet: Poet): Promise<void> {
  const poetName = poet.name || poet.fullName || 'شاعر';
  const { icon192, icon512 } = await resolveManifestIconUrls(poet.id);

  const manifest = buildPoetManifest(poet, icon192, icon512);
  const json = JSON.stringify(manifest);

  revokeIfBlob(manifestObjectUrl);
  manifestObjectUrl = URL.createObjectURL(
    new Blob([json], { type: 'application/manifest+json' }),
  );

  ensureLink('manifest', MANIFEST_LINK_ID, manifestObjectUrl);
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

export function restoreDefaultManifest(): void {
  revokeIfBlob(manifestObjectUrl);
  manifestObjectUrl = null;
  revokeIfBlob(appleIconObjectUrl);
  appleIconObjectUrl = null;

  ensureLink('manifest', MANIFEST_LINK_ID, `${BASE}manifest.webmanifest`);
  const titleMeta = document.getElementById(APPLE_TITLE_ID);
  titleMeta?.remove();
  const iconLink = document.getElementById(APPLE_ICON_ID);
  iconLink?.remove();
}
