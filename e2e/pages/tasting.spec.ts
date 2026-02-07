import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('テイスティングページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasting');
    await page.waitForLoadState('domcontentloaded');
  });

  test('テイスティングページのURLにアクセスできる', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログインページにリダイレクトされる', async ({ page }) => {
    const loginButton = page.getByText('ログイン');
    await expect(loginButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('認証済みの場合、ページタイトルが表示される', async ({ page }) => {
    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    const title = page.getByText('試飲感想記録');
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('認証済みの場合、セッション作成ボタンが表示される', async ({ page }) => {
    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    const createButton = page
      .locator('[aria-label="新規セッション作成"]')
      .or(page.getByText('セッションを作成'));
    await expect(createButton.first()).toBeVisible({ timeout: 10000 });
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
