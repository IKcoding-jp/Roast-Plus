import { test, expect } from '@playwright/test';

test.describe('クイズページ', () => {
  test('クイズトップページが表示される', async ({ page }) => {
    await page.goto('/coffee-trivia');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/coffee-trivia/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('クイズトップページにコンテンツが存在する', async ({ page }) => {
    await page.goto('/coffee-trivia');
    await page.waitForLoadState('domcontentloaded');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('クイズページに遷移できる', async ({ page }) => {
    await page.goto('/coffee-trivia/quiz?mode=daily');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/quiz/);
  });

  test('バッジページに遷移できる', async ({ page }) => {
    await page.goto('/coffee-trivia/badges');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/badges/);
  });

  test('統計ページに遷移できる', async ({ page }) => {
    await page.goto('/coffee-trivia/stats');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/stats/);
  });
});
