import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('欠点豆ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/defect-beans');
    await page.waitForLoadState('domcontentloaded');
  });

  test('欠点豆ページのURLにアクセスできる', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログインページにリダイレクトされる', async ({ page }) => {
    const loginButton = page.getByText('ログイン');
    await expect(loginButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('認証済みの場合、ページコンテンツが表示される', async ({ page }) => {
    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    const content = page.locator('body');
    const bodyText = await content.textContent();
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
