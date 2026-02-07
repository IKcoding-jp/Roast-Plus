import { test, expect } from '@playwright/test';

test.describe('ローストタイマーページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/roast-timer');
    await page.waitForLoadState('domcontentloaded');
  });

  test('タイマーページが表示される', async ({ page }) => {
    await expect(page).toHaveURL(/roast-timer/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('タイマーページにインタラクティブ要素がある', async ({ page }) => {
    // タイマーページには何らかのボタンまたはリンクが存在する
    const interactive = page.locator('button:visible, a:visible, input:visible');
    await expect(interactive.first()).toBeVisible({ timeout: 10000 });
  });

  test('手動入力モードが存在する場合、フィールドが使える', async ({ page }) => {
    const manualButton = page.getByText('手動入力').first();
    const isManualVisible = await manualButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isManualVisible) {
      await manualButton.click();
      const minInput = page.locator('[placeholder="分"]');
      await expect(minInput).toBeVisible({ timeout: 5000 });
      await minInput.fill('5');
      await expect(minInput).toHaveValue('5');

      const secInput = page.locator('[placeholder="秒"]');
      await expect(secInput).toBeVisible();
      await secInput.fill('30');
      await expect(secInput).toHaveValue('30');
    }
    // 手動入力が見えない場合: おすすめモードが表示されている可能性あり（認証依存）
  });
});
