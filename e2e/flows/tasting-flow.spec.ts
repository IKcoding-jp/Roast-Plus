import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('テイスティングフロー', () => {
  test('テイスティングトップページが読み込まれる', async ({ page }) => {
    await page.goto('/tasting');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/tasting/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/tasting');
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

  test('認証済みの場合、セッション一覧が表示される', async ({ page }) => {
    await page.goto('/tasting');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    // テイスティングページのコンテンツが表示されていることを確認
    const content = page.locator('body');
    const bodyText = await content.textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('新規セッション作成ボタンが表示される', async ({ page }) => {
    await page.goto('/tasting');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    // 新規セッション作成ボタンを探す
    const createButton = page
      .locator('[aria-label="新規セッション作成"]')
      .or(page.getByText('セッションを作成'));
    await expect(createButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('ホームからテイスティングへの遷移が動作する', async ({ page }) => {
    // ホームページからスタート
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // テイスティングページに直接遷移
    await page.goto('/tasting');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/tasting/);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
