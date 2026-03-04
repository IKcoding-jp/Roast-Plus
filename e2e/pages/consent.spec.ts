import { test, expect } from '@playwright/test';

test.describe('同意ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/consent');
    await page.waitForLoadState('domcontentloaded');
  });

  test('同意ページのURLにアクセスできる', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('ページにコンテンツが存在する', async ({ page }) => {
    const bodyText = await page.locator('body').textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('ページにクリティカルなJSエラーがない', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    await page.waitForLoadState('load');
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('Firebase') &&
        !e.includes('firestore') &&
        !e.includes('auth/')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
