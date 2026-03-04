import { test, expect } from '@playwright/test';

test.describe('コーヒークイズ サブページ', () => {
  test('バッジページにアクセスできる', async ({ page }) => {
    await page.goto('/coffee-trivia/badges');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('復習ページにアクセスできる', async ({ page }) => {
    await page.goto('/coffee-trivia/review');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('統計ページにアクセスできる', async ({ page }) => {
    await page.goto('/coffee-trivia/stats');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('カテゴリページにアクセスできる', async ({ page }) => {
    await page.goto('/coffee-trivia/category/taste');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
