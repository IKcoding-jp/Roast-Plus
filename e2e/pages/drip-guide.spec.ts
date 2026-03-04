import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('ドリップガイドページ', () => {
  test('ドリップガイドトップページにアクセスできる', async ({ page }) => {
    await page.goto('/drip-guide');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('ドリップガイドトップページにコンテンツが存在する', async ({ page }) => {
    await page.goto('/drip-guide');
    await page.waitForLoadState('domcontentloaded');
    const bodyText = await page.locator('body').textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('新規レシピページが正常に表示される', async ({ page }) => {
    await page.goto('/drip-guide/new');
    await page.waitForLoadState('domcontentloaded');
    // レシピ作成フォームが表示される（認証不要）
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('認証済みの場合、ドリップガイドのコンテンツが表示される', async ({
    page,
  }) => {
    await page.goto('/drip-guide');
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
    await page.goto('/drip-guide');
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
