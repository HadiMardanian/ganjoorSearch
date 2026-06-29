#!/usr/bin/env node
/**
 * Generate PNG icons (192/512) for poets from Ganjoor API.
 * Usage: node scripts/generate-poet-icons.mjs [--all | --ids=1,2,3]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/icons/poets');
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

function poetImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `https://api.ganjoor.net${imagePath}`;
}

async function loadSharp() {
  try {
    const mod = await import('sharp');
    return mod.default;
  } catch {
    console.error(
      'sharp is required. Install with: npm install --save-dev sharp',
    );
    process.exit(1);
  }
}

function getInitial(name) {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed.charAt(0) : '؟';
}

async function createFallbackIcon(sharp, name, size) {
  const initial = getInitial(name);
  const fontSize = Math.round(size * 0.45);
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#9a3412"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Tahoma, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#fff7ed">
        ${initial}
      </text>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function createIcon(sharp, poet, size) {
  const imageUrl = poetImageUrl(poet.imageUrl);
  if (!imageUrl) {
    return createFallbackIcon(sharp, poet.name || poet.fullName, size);
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('fetch failed');
    const buffer = Buffer.from(await response.arrayBuffer());
    return sharp(buffer)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer();
  } catch {
    return createFallbackIcon(sharp, poet.name || poet.fullName, size);
  }
}

async function main() {
  const { mode, ids } = parseArgs();
  const sharp = await loadSharp();
  const poets = await fetchPoets();

  let selected = poets;
  if (mode === 'top') {
    selected = poets.filter((poet) => TOP_POET_IDS.includes(poet.id));
  } else if (mode === 'ids') {
    selected = poets.filter((poet) => ids.includes(poet.id));
  }

  await mkdir(OUT_DIR, { recursive: true });

  let generated = 0;
  for (const poet of selected) {
    for (const size of [192, 512]) {
      const outPath = join(OUT_DIR, `${poet.id}-${size}.png`);
      const png = await createIcon(sharp, poet, size);
      await writeFile(outPath, png);
      generated += 1;
      console.log(`wrote ${outPath}`);
    }
  }

  console.log(`Done. Generated ${generated} icons for ${selected.length} poets.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
