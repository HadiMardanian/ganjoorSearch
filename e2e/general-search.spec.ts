import { test, expect } from '@playwright/test';

test.describe('General search', () => {
  test('search opens in-app reader and returns with scroll', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('جستجوی کلمه در اشعار...').fill('جام');
    await page.getByRole('button', { name: 'جستجو' }).click();
    await expect(page.getByText(/قطعه|نتیجه|جام/).first()).toBeVisible({ timeout: 20000 });

    await page.evaluate(() => window.scrollTo(0, 400));
    const scrollBefore = await page.evaluate(() => window.scrollY);

    const poemButton = page.locator('button, a').filter({ hasText: /غزل|شماره|جام/ }).first();
    await poemButton.click();
    await expect(page.getByRole('button', { name: 'بازگشت' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('button', { name: 'کپی' })).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: 'بازگشت' }).click();
    await expect(page.getByPlaceholder('جستجوی کلمه در اشعار...')).toBeVisible();

    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeGreaterThan(100);
    expect(scrollAfter).toBeGreaterThanOrEqual(scrollBefore - 50);
  });
});
