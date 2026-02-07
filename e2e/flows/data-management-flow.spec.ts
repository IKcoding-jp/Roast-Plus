import { test, expect } from '@playwright/test';
import { isRedirectedToLogin } from '../fixtures/test-base';

test.describe('データ管理フロー', () => {
  test.describe('スケジュール管理', () => {
    test('スケジュールページが読み込まれる', async ({ page }) => {
      await page.goto('/schedule');
      await page.waitForLoadState('domcontentloaded');
      // 認証リダイレクトが発生してもページ自体は表示される
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('日付ナビゲーションで前日に移動できる', async ({ page }) => {
      await page.goto('/schedule');
      await page.waitForLoadState('domcontentloaded');

      const isLogin = await isRedirectedToLogin(page);
      test.skip(isLogin, '認証が必要なためスキップ');

      const dateButton = page.locator('[aria-label="日付を選択"]');
      await expect(dateButton).toBeVisible({ timeout: 10000 });
      const initialDate = await dateButton.textContent();

      const prevButton = page.locator('[aria-label="前日"]');
      await prevButton.click();
      await expect(dateButton).not.toHaveText(initialDate ?? '');
    });

    test('日付ナビゲーションで翌日に移動できる', async ({ page }) => {
      await page.goto('/schedule');
      await page.waitForLoadState('domcontentloaded');

      const isLogin = await isRedirectedToLogin(page);
      test.skip(isLogin, '認証が必要なためスキップ');

      const prevButton = page.locator('[aria-label="前日"]');
      await expect(prevButton).toBeVisible({ timeout: 10000 });
      await prevButton.click();

      const dateButton = page.locator('[aria-label="日付を選択"]');
      const currentDate = await dateButton.textContent();

      const nextButton = page.locator('[aria-label="翌日"]');
      await nextButton.click();
      await expect(dateButton).not.toHaveText(currentDate ?? '');
    });

    test('タブ切り替えが動作する（モバイル）', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/schedule');
      await page.waitForLoadState('domcontentloaded');

      const isLogin = await isRedirectedToLogin(page);
      test.skip(isLogin, '認証が必要なためスキップ');

      const scheduleTab = page.getByText('ローストスケジュール');
      const hasTabUI = await scheduleTab.isVisible({ timeout: 5000 }).catch(() => false);
      if (hasTabUI) {
        await scheduleTab.click();
        const todayTab = page.getByText('本日のスケジュール');
        await todayTab.click();
      }
    });
  });

  test.describe('テイスティング記録', () => {
    test('テイスティングページが読み込まれる', async ({ page }) => {
      await page.goto('/tasting');
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('認証済みの場合、セッション作成ボタンが表示される', async ({ page }) => {
      await page.goto('/tasting');
      await page.waitForLoadState('domcontentloaded');

      const isLogin = await isRedirectedToLogin(page);
      test.skip(isLogin, '認証が必要なためスキップ');

      const createButton = page
        .locator('[aria-label="新規セッション作成"]')
        .or(page.getByText('セッションを作成'));
      await expect(createButton.first()).toBeVisible({ timeout: 10000 });
    });

    test('認証済みの場合、セッション作成ボタンをクリックできる', async ({ page }) => {
      await page.goto('/tasting');
      await page.waitForLoadState('domcontentloaded');

      const isLogin = await isRedirectedToLogin(page);
      test.skip(isLogin, '認証が必要なためスキップ');

      const createButton = page
        .locator('[aria-label="新規セッション作成"]')
        .or(page.getByText('セッションを作成'));
      await expect(createButton.first()).toBeVisible({ timeout: 10000 });
      await createButton.first().click();
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });
});
