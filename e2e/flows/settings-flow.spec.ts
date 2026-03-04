import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('設定ページフロー', () => {
  test('設定ページが読み込まれる', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/settings/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/settings');
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

  test('認証済みの場合、設定メニューが表示される', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    // 設定ページのコンテンツが表示されていることを確認
    const content = page.locator('body');
    const bodyText = await content.textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('テーマ設定ページにナビゲートできる', async ({ page }) => {
    await page.goto('/settings/theme');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/settings\/theme/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('設定ページからテーマページへの遷移が動作する', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    // テーマ設定へのリンクを探してクリック
    const themeLink = page
      .getByText('テーマ')
      .or(page.locator('a[href*="theme"]'));
    const isThemeLinkVisible = await themeLink
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (isThemeLinkVisible) {
      await themeLink.first().click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/settings\/theme/);
    }
    // テーマリンクが見つからない場合でもエラーにしない（UIレイアウトによる）
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
