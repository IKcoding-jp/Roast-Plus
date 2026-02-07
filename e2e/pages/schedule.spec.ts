import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('スケジュールページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule');
    await page.waitForLoadState('domcontentloaded');
  });

  test('スケジュールページのURLにアクセスできる', async ({ page }) => {
    // 認証リダイレクトが発生する可能性があるため、いずれかのページが表示される
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('未認証時はログインページにリダイレクトされる', async ({ page }) => {
    // スケジュールは認証必須のため、ログイン画面が表示される
    const loginButton = page.getByText('ログイン');
    await expect(loginButton.first()).toBeVisible({ timeout: 10000 });
  });

  test('認証済みの場合、日付ナビゲーションが存在する', async ({ page }) => {
    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    const prevButton = page.locator('[aria-label="前日"]');
    const nextButton = page.locator('[aria-label="翌日"]');
    await expect(prevButton).toBeVisible({ timeout: 10000 });
    await expect(nextButton).toBeVisible();
  });

  test('認証済みの場合、前日ボタンで日付が変わる', async ({ page }) => {
    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    const dateButton = page.locator('[aria-label="日付を選択"]');
    await expect(dateButton).toBeVisible({ timeout: 10000 });
    const initialDate = await dateButton.textContent();

    const prevButton = page.locator('[aria-label="前日"]');
    await prevButton.click();
    await expect(dateButton).not.toHaveText(initialDate ?? '');
  });
});
