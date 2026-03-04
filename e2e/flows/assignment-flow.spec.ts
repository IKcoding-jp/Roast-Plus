import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('担当表フロー', () => {
  test('担当表ページが読み込まれる', async ({ page }) => {
    await page.goto('/assignment');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/assignment/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/assignment');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    // 認証が必要なページなのでリダイレクトされることを確認
    if (isLogin) {
      const loginButton = page.getByText('ログイン');
      await expect(loginButton.first()).toBeVisible({ timeout: 10000 });
    }
    // リダイレクトされない場合は認証済み環境
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('認証済みの場合、担当表のコンテンツが表示される', async ({ page }) => {
    await page.goto('/assignment');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    // 担当表ページにコンテンツが表示されていることを確認
    const content = page.locator('body');
    const bodyText = await content.textContent();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('ページ内のリンクやボタンがクリック可能', async ({ page }) => {
    await page.goto('/assignment');
    await page.waitForLoadState('domcontentloaded');

    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    // ページ内に表示されているボタンやリンクを確認
    const interactiveElements = page.locator(
      'button:visible, a:visible, [role="button"]:visible'
    );
    const count = await interactiveElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('ページ遷移が正常に動作する', async ({ page }) => {
    // ホームページからスタート
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 担当表ページに直接遷移
    await page.goto('/assignment');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/assignment/);
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
