#!/usr/bin/env node
/**
 * Integration + unit checks for search, categories, and export logic.
 * Run: npm run verify
 */

const API = 'https://api.ganjoor.net/api/ganjoor';
const HAFEZ_POET_ID = 2;
const HAFEZ_GHAZAL_CAT_ID = 24;

let passed = 0;
let failed = 0;

function ok(name) {
  passed++;
  console.log(`  ✓ ${name}`);
}

function fail(name, detail) {
  failed++;
  console.error(`  ✗ ${name}`);
  if (detail) console.error(`    ${detail}`);
}

function assert(name, condition, detail) {
  if (condition) ok(name);
  else fail(name, detail);
}

function escapeCsv(value) {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function api(path) {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) {
    throw new Error(`${path} => ${response.status}`);
  }
  return response;
}

async function searchMeta(params) {
  const qs = new URLSearchParams(params);
  const response = await api(`/poems/search?${qs}`);
  const items = await response.json();
  const paging = JSON.parse(response.headers.get('paging-headers') || '{}');
  return { items, paging };
}

async function fetchAllPages(term, poetId, catId) {
  const first = await searchMeta({
    term,
    poetId: String(poetId),
    catId: String(catId),
    PageNumber: '1',
    PageSize: '200',
  });

  let all = [...first.items];
  const totalPages = first.paging.totalPages || 1;

  for (let page = 2; page <= totalPages; page++) {
    const next = await searchMeta({
      term,
      poetId: String(poetId),
      catId: String(catId),
      PageNumber: String(page),
      PageSize: '200',
    });
    all = all.concat(next.items);
  }

  return { all, totalCount: first.paging.totalCount, totalPages };
}

async function testCategories() {
  console.log('\nCategories');

  const bad = await fetch(`${API}/cat/${HAFEZ_POET_ID}?poems=false`);
  assert('old /cat/{poetId} endpoint is 404', bad.status === 404);

  const poet = await (await api(`/poet/${HAFEZ_POET_ID}`)).json();
  const children = poet.cat?.children ?? [];
  assert('poet endpoint returns category children', children.length >= 5);
  assert(
    'includes غزلیات',
    children.some((c) => c.title === 'غزلیات'),
    JSON.stringify(children.map((c) => c.title)),
  );
}

async function testSearchFilters() {
  console.log('\nSearch filters');

  const allHafez = await searchMeta({
    term: 'جام',
    poetId: String(HAFEZ_POET_ID),
    PageNumber: '1',
    PageSize: '20',
  });
  assert('حافظ + جام total is 168', allHafez.paging.totalCount === 168);

  const ghazal = await searchMeta({
    term: 'جام',
    poetId: String(HAFEZ_POET_ID),
    catId: String(HAFEZ_GHAZAL_CAT_ID),
    PageNumber: '1',
    PageSize: '20',
  });
  assert('حافظ + غزلیات + جام total is 137', ghazal.paging.totalCount === 137);

  assert(
    'category filter reduces results',
    ghazal.paging.totalCount < allHafez.paging.totalCount,
  );
}

function testSearchExcerpt() {
  console.log('\nSearch excerpt');

  const robaeeText =
    'چون روز علم زند به نامت ماند\nچون یک شبه شد ماه به جامت ماند\nتقدیر به عزم تیز گامت ماند';
  assert(
    'excerpt context includes جامت line',
    robaeeText.includes('جامت'),
  );

  const qasideText =
    'می لعل پیش آر و پیش من آی\nبه یک دست جام و به یک دست چنگ\nاز آن می مرا ده که از عکس او';
  assert(
    'qaside text includes standalone جام',
    qasideText.split('\n')[1].includes('جام'),
  );
}

async function testFirstResultMeta() {
  console.log('\nResult metadata');

  const items = await (
    await api('/poems/search?term=' + encodeURIComponent('جام') + '&PageNumber=1&PageSize=1')
  ).json();

  const first = items[0];
  assert('API returns fullTitle', Boolean(first.fullTitle));
  assert(
    'fullTitle includes poet breadcrumb',
    first.fullTitle.includes('»'),
    first.fullTitle,
  );
}

async function testExportPagination() {
  console.log('\nExport pagination');

  const { all, totalCount } = await fetchAllPages('جام', HAFEZ_POET_ID, HAFEZ_GHAZAL_CAT_ID);
  assert(
    'fetch all pages matches totalCount for غزلیات',
    all.length === totalCount,
    `got ${all.length}, expected ${totalCount}`,
  );
  assert('غزلیات export count is 137', all.length === 137);
}

function testCsvEscape() {
  console.log('\nCSV export');

  assert(
    'escapes commas',
    escapeCsv('سلام, دنیا') === '"سلام, دنیا"',
  );
  assert(
    'escapes quotes',
    escapeCsv('گفت "جام"') === '"گفت ""جام"""',
  );
  assert(
    'plain text unchanged',
    escapeCsv('جام') === 'جام',
  );
}

async function main() {
  console.log('GanjoorSearch verify\n');

  testCsvEscape();
  testSearchExcerpt();
  await testCategories();
  await testSearchFilters();
  await testFirstResultMeta();
  await testExportPagination();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
