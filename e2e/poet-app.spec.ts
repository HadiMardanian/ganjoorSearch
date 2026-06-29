import { test, expect } from '@playwright/test';

const HAFEZ_POET_ID = 2;
const HAFEZ_GHAZAL_CAT_ID = 24;

test.describe('Poet app flows (URL state)', () => {
  test('browse home shows poet categories', async ({ page }) => {
    await page.goto(`?poet=${HAFEZ_POET_ID}&source=pwa&tab=browse`);
    await expect(page.getByRole('button', { name: 'غزلیات' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'شعر تصادفی' })).toBeVisible();
  });

  test('category path opens poem list', async ({ page }) => {
    await page.goto(
      `?poet=${HAFEZ_POET_ID}&source=pwa&tab=browse&bpath=${HAFEZ_GHAZAL_CAT_ID}`,
    );
    await expect(page.getByRole('button', { name: /غزل/ }).first()).toBeVisible();
  });

  test('browse → poem list → reader', async ({ page }) => {
    await page.goto(
      `?poet=${HAFEZ_POET_ID}&source=pwa&tab=browse&bpath=${HAFEZ_GHAZAL_CAT_ID}`,
    );
    await page.getByRole('button', { name: /غزل/ }).first().click();
    await expect(page.getByRole('button', { name: 'بازگشت' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'کپی' })).toBeVisible();
  });

  test('random poem opens reader', async ({ page }) => {
    await page.goto(`?poet=${HAFEZ_POET_ID}&source=pwa&tab=browse`);
    await page.getByRole('button', { name: 'شعر تصادفی' }).click();
    await expect(page.getByRole('button', { name: 'بازگشت' })).toBeVisible({
      timeout: 45_000,
    });
  });

  test('search tab shows search form in poet app', async ({ page }) => {
    await page.goto(`?poet=${HAFEZ_POET_ID}&source=pwa&tab=search`);
    await expect(page.getByPlaceholder('جستجوی کلمه در اشعار...')).toBeVisible();
  });
});

test.describe('Deep links', () => {
  test('poem URL opens reader in poet app', async ({ page }) => {
    await page.goto(`?poet=${HAFEZ_POET_ID}&source=pwa&tab=browse&bpath=${HAFEZ_GHAZAL_CAT_ID}`);
    const firstPoem = page.getByRole('button', { name: /غزل/ }).first();
    await firstPoem.click();
    await expect(page.getByRole('button', { name: 'بازگشت' })).toBeVisible();

    const url = page.url();
    const poemParam = new URL(url).searchParams.get('poem');
    expect(poemParam).toBeTruthy();

    await page.goto(`?poet=${HAFEZ_POET_ID}&source=pwa&tab=browse&poem=${encodeURIComponent(poemParam!)}`);
    await expect(page.getByRole('button', { name: 'بازگشت' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'لینک شعر' })).toBeVisible();
  });
});
