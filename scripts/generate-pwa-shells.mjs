#!/usr/bin/env node
/**
 * Copy dist/index.html to dist/pwa/{id}/index.html for each poet manifest.
 * GitHub Pages returns HTTP 404 for nested SPA paths unless a real file exists;
 * installed PWAs with start_url /pwa/{id}/ can show a blank page on 404 responses.
 */
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '../dist');
const MANIFESTS = join(__dirname, '../public/manifests');
const SHELL = join(DIST, 'index.html');

async function main() {
  const files = await readdir(MANIFESTS);
  const poetIds = files
    .map((name) => {
      const match = name.match(/^poet-(\d+)\.webmanifest$/);
      return match ? Number(match[1]) : null;
    })
    .filter((id) => id != null);

  if (poetIds.length === 0) {
    console.warn('No poet manifests found — skipping PWA shell generation.');
    return;
  }

  for (const poetId of poetIds) {
    const dir = join(DIST, 'pwa', String(poetId));
    await mkdir(dir, { recursive: true });
    await copyFile(SHELL, join(dir, 'index.html'));
  }

  console.log(`Done. Generated ${poetIds.length} PWA shell pages under dist/pwa/{id}/index.html`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
