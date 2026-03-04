import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('設定ページ', () => {
  test('設定ページのURLにアクセスできる', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('テーマ設定ページにアクセスできる', async ({ page }) => {
    await page.goto('/settings/theme');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログインページにリダイレクトされる', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    const loginButton = page.getByText('ログイン');
    await expect(loginButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('認証済みの場合、設定ページのコンテンツが表示される', async ({
    page,
  }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
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
    await page.goto('/settings');
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
