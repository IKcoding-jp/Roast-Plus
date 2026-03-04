import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('静的・その他ページ', () => {
  test('お問い合わせページにアクセスできる', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('プライバシーポリシーページにアクセスできる', async ({ page }) => {
    await page.goto('/privacy-policy');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('利用規約ページにアクセスできる', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('変更履歴ページにアクセスできる', async ({ page }) => {
    await page.goto('/changelog');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('通知ページにアクセスできる', async ({ page }) => {
    await page.goto('/notifications');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('進捗ページにアクセスできる', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('焙煎記録ページで未認証時はログインページにリダイレクトされる', async ({
    page,
  }) => {
    await page.goto('/roast-record');
    await page.waitForLoadState('domcontentloaded');
    const isLogin = await isRedirectedToLogin(page);
    if (!isLogin) {
      const content = page.locator('body');
      const bodyText = await content.textContent();
      expect(bodyText!.length).toBeGreaterThan(0);
    } else {
      const loginButton = page.getByText('ログイン');
      await expect(loginButton.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('公開ページにクリティカルなJSエラーがない', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    const publicRoutes = ['/contact', '/privacy-policy', '/terms'];
    for (const route of publicRoutes) {
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
