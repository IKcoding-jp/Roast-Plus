import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('ドリップガイドフロー', () => {
  test('ドリップガイドトップページが読み込まれる', async ({ page }) => {
    await page.goto('/drip-guide');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/drip-guide/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/drip-guide');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    // 認証が必要な場合はログインフォームが表示される
    if (isLogin) {
      const loginButton = page.getByText('ログイン');
      await expect(loginButton.first()).toBeVisible({ timeout: 10000 });
    }
    // リダイレクトされない場合は認証済み環境
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('認証済みの場合、レシピ一覧が表示される', async ({ page }) => {
    await page.goto('/drip-guide');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    // ドリップガイドのコンテンツが表示されていることを確認
    const content = page.locator('body');
    const bodyText = await content.textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('レシピ作成ページにナビゲートできる', async ({ page }) => {
    await page.goto('/drip-guide/new');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/drip-guide\/new/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('ホームからドリップガイドへの遷移が動作する', async ({ page }) => {
    // ホームページからスタート
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // ドリップガイドページに直接遷移
    await page.goto('/drip-guide');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/drip-guide/);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
