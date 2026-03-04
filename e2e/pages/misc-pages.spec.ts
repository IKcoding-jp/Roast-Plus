import { test, expect } from '@playwright/test';

test.describe('その他のページ', () => {
  test('時計ページにアクセスできる', async ({ page }) => {
    await page.goto('/clock');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('抽出ページにアクセスできる', async ({ page }) => {
    await page.goto('/brewing');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('開発ストーリーページにアクセスできる', async ({ page }) => {
    await page.goto('/dev-stories');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('デザインラボページにアクセスできる', async ({ page }) => {
    await page.goto('/dev/design-lab');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('ページにクリティカルなJSエラーがない', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    const routes = ['/clock', '/brewing', '/dev-stories'];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('load');
    }

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('Firebase') &&
        !e.includes('firestore') &&
        !e.includes('auth/')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
