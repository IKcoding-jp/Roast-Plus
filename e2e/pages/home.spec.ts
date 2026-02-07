import { test, expect } from '@playwright/test';

test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('ページが正常に表示される', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログイン画面が表示される', async ({ page }) => {
    // Firebase未設定のE2E環境では認証リダイレクトでログイン画面が表示される
    const loginButton = page.getByText('ログイン');
    await expect(loginButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('ログイン画面にインタラクティブ要素がある', async ({ page }) => {
    const buttons = page.locator('button:visible, a:visible, input:visible');
    await expect(buttons.first()).toBeVisible({ timeout: 10000 });
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('ページにクリティカルなJSエラーがない', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    await page.waitForLoadState('load');
    // Firebase初期化エラーはE2E環境で想定内なので除外
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('Firebase') &&
        !e.includes('firestore') &&
        !e.includes('auth/')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
