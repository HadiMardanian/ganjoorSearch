#!/usr/bin/env node
/**
 * Generate per-poet PWA manifest files for reliable install (no blob URLs).
 * Usage: node scripts/generate-poet-manifests.mjs [--all | --ids=1,2,3]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/manifests');
const BASE = '/ganjoorSearch/';
const API = 'https://api.ganjoor.net/api/ganjoor';

const TOP_POET_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
];

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes('--all')) return { mode: 'all' };
  const idsArg = args.find((arg) => arg.startsWith('--ids='));
  if (idsArg) {
    const ids = idsArg
      .slice(6)
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isFinite(id) && id > 0);
    return { mode: 'ids', ids };
  }
  return { mode: 'top' };
}

async function fetchPoets() {
  const response = await fetch(`${API}/poets`);
  if (!response.ok) throw new Error(`Failed to fetch poets: ${response.status}`);
  return response.json();
}

function buildManifest(poet) {
  const poetName = poet.name || poet.fullName || 'شاعر';
  const icon192 = `${BASE}icons/poets/${poet.id}-192.png`;
  const icon512 = `${BASE}icons/poets/${poet.id}-512.png`;
  const scope = `${BASE}pwa/${poet.id}/`;
  const manifestId = `${BASE}pwa/${poet.id}`.replace(/\/$/, '');
  const manifestUrl = `${BASE}manifests/poet-${poet.id}.webmanifest`;

  return {
    id: manifestId,
    name: `${poetName} — گنجورسرچ`,
    short_name: poetName,
    description: `جستجوی اشعار ${poetName} با گنجورسرچ`,
    lang: 'fa',
    dir: 'rtl',
    start_url: `${scope}?source=pwa&tab=browse`,
    scope,
    display: 'standalone',
    capture_links: 'none',
    background_color: '#f7f4ef',
    theme_color: '#9a3412',
    related_applications: [
      { platform: 'webapp', url: manifestUrl, id: manifestId },
    ],
    icons: [
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

async function main() {
  const { mode, ids } = parseArgs();
  const poets = await fetchPoets();

  let selected = poets;
  if (mode === 'top') {
    selected = poets.filter((poet) => TOP_POET_IDS.includes(poet.id));
  } else if (mode === 'ids') {
    selected = poets.filter((poet) => ids.includes(poet.id));
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const poet of selected) {
    const outPath = join(OUT_DIR, `poet-${poet.id}.webmanifest`);
    const manifest = buildManifest(poet);
    await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`wrote ${outPath}`);
  }

  console.log(`Done. Generated ${selected.length} poet manifests.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
